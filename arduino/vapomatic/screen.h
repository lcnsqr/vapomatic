#ifndef Screen_h
#define Screen_h

#include "session.h"
#include "display.h"

enum ScreenItemType { DBL, INT, BOOL };

struct ScreenItem {
  String label;
  // Formato do valor
  enum ScreenItemType sessionType;
  // Formato de exibição
  enum ScreenItemType screenType;
  // Valor
  union {
    int *i;
    double *d;
  } value;
};
  
class Screen {
  public:
  Screen(Session* session, U8G2_SH1106_128X64_NONAME_2_HW_I2C* display);

  // Exibir UI atual no display
  virtual void show();

  // Rotary encoder clockwise
  virtual void cw();

  // Rotary encoder counter-clockwise
  virtual void ccw();

  // Reagir ao pressionamento dos botões
  virtual Screen* btTopDown();
  virtual Screen* btTopUp();
  virtual Screen* btFrontDown();
  virtual Screen* btFrontUp();

  protected:
  Session* session;
  U8G2_SH1106_128X64_NONAME_2_HW_I2C* display;
};

class scrSplash: public Screen {
  public:
  scrSplash(Session* session, U8G2_SH1106_128X64_NONAME_2_HW_I2C* display);
  void show();
  void cw();
  void ccw();
  Screen* btTopDown();
  Screen* btTopUp();
  Screen* btFrontDown();
  Screen* btFrontUp();
};

class scrMain: public Screen {
  public:
  scrMain(Session* session, U8G2_SH1106_128X64_NONAME_2_HW_I2C* display);
  void show();
  void cw();
  void ccw();
  Screen* btTopDown();
  Screen* btTopUp();
  Screen* btFrontDown();
  Screen* btFrontUp();

  // Tela exibida ao pressionar botão central
  Screen* leave;
};

class scrDebug: public Screen {
  public:
  scrDebug(Session* session, U8G2_SH1106_128X64_NONAME_2_HW_I2C* display);
  void show();
  void cw();
  void ccw();
  Screen* btTopDown();
  Screen* btTopUp();
  Screen* btFrontDown();
  Screen* btFrontUp();

  // Tela exibida ao pressionar botão central
  Screen* leave;

  // Itens na tela
  int nitems;
  int selected;
  ScreenItem* items;
};

#endif
