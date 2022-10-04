#include "task.h"
#include "session.h"
#include "therm.h"
#include "display.h"
#include "monitor.h"
#include "rotary.h"
#include "fan.h"
#include "heater.h"
#include "timer.h"
#include "shutdown.h"
#include "screen.h"

// Estado do aparelho e comunicação interserviços
Session session;
// Loop de serviços
Tasks tasks;
// Leitura da temperatura
Therm therm(&session, A0, 3*17, 17);
// Display helper library
U8G2_SH1106_128X64_NONAME_2_HW_I2C display(U8G2_R2, U8X8_PIN_NONE);
// Telas da UI
scrMain uiMain(&session, &display);
scrCalib uiCalib(&session, &display);
struct CalibItem scrCalibItems[3];
// Monitoramento de eventos
Monitor monitor(&session, &uiMain, 4, 8, 25);
// Callback de eventos do rotary encoder
Rotary rotary;
// Controle da ventoinha
Fan fan(&session, 7, 75);
// Controle do aquecedor
Heater heater(&session, 5, 38);
// Contador de tempo
Timer timer(&session, 1000);
// Para de encher automaticamente
Shutdown shutdown(&session, 500);

void setup() {

  // Configurar sessão
  session.load();

  // Definições de UI
  setupUI();

  // Serviços
  tasks.add(&therm);
  tasks.add(&monitor);
  tasks.add(&fan);
  tasks.add(&heater);
  tasks.add(&timer);
  tasks.add(&shutdown);

}

void loop() {
  tasks.run();
}

void setupUI() {

  // Qual tela chamar com botão frontal na tela principal
  uiMain.leave = &uiCalib;

  /**
    * Itens na tela de calibragem
    */
  // Primeira leitura
  scrCalibItems[0].label = "Mínimo";
  scrCalibItems[0].tempCore = &(session.settings.tempCore[0]);
  scrCalibItems[0].tempEx = &(session.settings.tempEx[0]);

  // Segunda leitura
  scrCalibItems[1].label = "Meio";
  scrCalibItems[1].tempCore = &(session.settings.tempCore[1]);
  scrCalibItems[1].tempEx = &(session.settings.tempEx[1]);

  // Terceira leitura
  scrCalibItems[2].label = "Máximo";
  scrCalibItems[2].tempCore = &(session.settings.tempCore[2]);
  scrCalibItems[2].tempEx = &(session.settings.tempEx[2]);

  uiCalib.nitems = 3;
  uiCalib.items = scrCalibItems;
  uiCalib.highlight = 0;
  uiCalib.edit = -1;
  uiCalib.leave = &uiMain;


  // Subir display
  display.begin();

}
