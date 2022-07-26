#include "task.h"
#include "timer.h"
#include "session.h"
#include <Arduino.h>

Timer::Timer(Session* session, unsigned long wait): Task(wait), session(session) {
  on = 0;
  started = 0;
  elapsed = 0;
}

void Timer::action(){
  
  if ( session->on != on ){
    on = session->on;
    if ( on ){
      started = millis();
      session->elapsed = 0;
      elapsed = 0;
    }
  }

  if ( on ){
    elapsed = millis() - started;
    session->elapsed = elapsed / 1000;
  }

}
