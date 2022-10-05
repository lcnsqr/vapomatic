#include "task.h"
#include "heater.h"
#include <Arduino.h>

Heater::Heater(Session* session, int pin, unsigned long wait): Task(wait), session(session), pin(pin) {
  pinMode(pin, OUTPUT);

  c0 = &(session->settings.PID[0]);
  c1 = &(session->settings.PID[1]);
  c2 = &(session->settings.PID[2]);
  P = &(session->PID[0]);
  I = &(session->PID[1]);
  D = &(session->PID[2]);
  dif_old = &(session->PID[3]);
  F = &(session->PID[4]);
}

void Heater::action(){
  if ( ! session->running() || session->dryrun ){
    analogWrite(pin, 0);
    return;
  }
  
  float dif = (float)wait * (session->tempeTarget - session->tempeEx);

  *P = *c0 * dif;
  *I = *I + *c1 * dif;
  // Resfriamento passivo
  if ( *I < 0 ) *I = 0;
  *D = *c2 * (dif - *dif_old);

  *F = *P + *I + *D;
  if ( *F < 0 ) *F = 0;
  if ( *F > 255 ) *F = 255;

  analogWrite(pin, (int)*F);

  *dif_old = dif;
}
