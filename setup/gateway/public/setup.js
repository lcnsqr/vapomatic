// Ponto de calibragem ativo
var calibIndex = -1
var calibEnabled = 0
var calibPointsLabels = []
var calibPointsValues = []
document.querySelectorAll("#calibPoints input[type='number']").forEach((p) => {
  calibPointsLabels.push(p.value)
  calibPointsValues.push(Number(p.value))
})

function exec(command){
	var xhr = new XMLHttpRequest();
	xhr.open('GET', "/command/"+command+"/"+Date.now())
	xhr.onload = function() {
		if (xhr.status === 204) {
      //console.log('Request accepted')
		}
		else {
			console.log('Request failed. Return code: ' + xhr.status)
		}
	}
	xhr.send()
}

var tempChart = new Chart(document.getElementById('tempChart'), {
	type: 'line',
	data: {
		datasets: [
      {
        label: 'Alvo',
        data: [],
        borderWidth: 1
      },
      {
        label: 'Interna',
        data: [],
        borderWidth: 1
      },
      {
        label: 'Sonda',
        data: [],
        borderWidth: 1
      }
		]
	},
	options: {
    aspectRatio: 1,
    elements: {
      point: {
        radius: 0
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'Temperaturas'
      }
    },
		scales: {
			y: {
				min: 0,
				max: 400
			}
		}
	}
});


var heatChart = new Chart(document.getElementById('heatChart'), {
	type: 'line',
	data: {
		datasets: [
      {
        label: 'Carga',
        data: [],
        borderWidth: 1
      }
		]
	},
	options: {
    aspectRatio: 1,
    elements: {
      point: {
        radius: 0
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'Aquecimento'
      }
    },
		scales: {
			y: {
				min: 0,
				max: 255
			}
		}
	}
});

var calibChart = new Chart(document.getElementById('calibChart'), {
	data: {
    labels: calibPointsLabels,
		datasets: [
      {
        label: 'Interna',
        type: 'line',
        data: [41.4774, 50.478, 67.1353, 89.0274, 111.3144, 135.9429, 159.0067, 170.4296],
        borderWidth: 1
      },
      {
        label: 'Sonda',
        type: 'line',
        data: [58.6422, 97.5441, 128.6569, 156.2304, 178.1863, 199.7745, 215.4559, 225.4804],
        borderWidth: 1
      }
		]
	},
	options: {
    aspectRatio: 1,
    elements: {
      point: {
        radius: 5
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'Calibragem'
      }
    },
		scales: {
      x: {
        min: 0,
        max: 255
      },
			y: {
				min: 0,
				max: 400
			}
		}
	}
});


var derivChart = new Chart(document.getElementById('derivChart'), {
  type: 'bar',
	data: {
  labels: ['Interna', 'Sonda', 'Carga'],
		datasets: [
      {
        label: 'Estável se próximo de zero',
        data: [0, 0, 0],
        borderWidth: 1
      }
		]
	},
	options: {
    aspectRatio: 1,
    plugins: {
      title: {
        display: true,
        text: 'Estabilidade recente'
      }
    },
		scales: {
			y: {
				min: -1,
				max: 1
			}
		}
	}
});

// Conexão WebSocket
ws = new WebSocket('ws://127.0.0.1:8888')

ws.onopen = function(event){
  //console.log("Conexão websocket aberta")
}

ws.onmessage = function(event){
  var data = JSON.parse(event.data)

  // Gráficos
  tempChart.data.datasets[0].data = data.graph.target
  tempChart.data.datasets[1].data = data.graph.core
  tempChart.data.datasets[2].data = data.graph.probe
  tempChart.update('none')
  heatChart.data.datasets[0].data = data.graph.heat
  heatChart.update('none')

  // Calibragem
  if ( calibEnabled && document.querySelector('button#calibSwitch').dataset.state == "1" ){
    calibChart.data.datasets[0].data[calibIndex] = data.graph.core[data.graph.core.length-1].y
    calibChart.data.datasets[1].data[calibIndex] = data.graph.probe[data.graph.probe.length-1].y
    calibChart.update()
  }

  // Estabilidade recente
  derivChart.data.datasets[0].data = [data.deriv.core, data.deriv.probe, data.deriv.heat]
  derivChart.update('none')

  // Estado
  document.querySelector('#state td[data-id="on"]').innerHTML = (data.on != 0) ? "Sim" : "Não";
  document.querySelector('#state td[data-id="elapsed"]').innerHTML = data.elapsed;

  if ( data.fan != 0 ){
    document.querySelectorAll('form#calibPoints input[type="radio"][name="index"]').forEach((p) => {
      p.disabled = false
    })
    document.querySelector('#state td[data-id="fan"]').innerHTML = "Sim"
    document.querySelectorAll('.calibButton').forEach((b) => {
      b.disabled = false
    })
    calibEnabled = 1
  }
  else {
    if ( calibEnabled == 1 ) exec("heat 0")
    document.querySelectorAll('form#calibPoints input[type="radio"][name="index"]').forEach((p) => {
      p.disabled = true
    })
    document.querySelector('#state td[data-id="fan"]').innerHTML = "Não"
    document.querySelectorAll('.calibButton#calibSwitch').forEach((b) => {
      b.disabled = true
    })
    calibEnabled = 0
  }

  document.querySelector('#state td[data-id="target"]').innerHTML = data.graph.target[data.graph.target.length-1].y;
  document.querySelector('#state td[data-id="core"]').innerHTML = data.graph.core[data.graph.core.length-1].y;
  document.querySelector('#state td[data-id="ex"]').innerHTML = data.graph.ex[data.graph.ex.length-1].y;
  document.querySelector('#state td[data-id="probe"]').innerHTML = data.graph.probe[data.graph.probe.length-1].y;
  document.querySelector('#state td[data-id="heat"]').innerHTML = data.graph.heat[data.graph.heat.length-1].y;

  document.querySelector('#state td[data-id="pid0"]').innerHTML = data.PID[0];
  document.querySelector('#state td[data-id="pid1"]').innerHTML = data.PID[1];
  document.querySelector('#state td[data-id="pid2"]').innerHTML = data.PID[2];
}

document.querySelector('form#prompt').addEventListener("submit", function(event){
  event.preventDefault()
	var command = this.querySelector('input[name="command"]').value
	if ( command.trim().length == 0 ) return

  exec(command)
  document.querySelector('form#prompt').reset()

})

document.querySelector('form#calibPoints').addEventListener("submit", function(event){
  event.preventDefault()
})

document.querySelector('button#calibSwitch').addEventListener("click", function(event){
  if ( ! calibEnabled ) return
  if ( this.dataset.state == '1' ){
    exec("heat 0")
    this.dataset.state = 0
    this.innerHTML = "Iniciar"
    calibIndex = -1
  }
  else {
    this.dataset.state = 1
    this.innerHTML = "Parar"
    document.querySelectorAll('form#calibPoints input[type="radio"][name="index"]').forEach((p) => {
      if ( p.checked ){
        calibIndex = p.value
        console.log(p.dataset.heat)
        exec("heat "+p.dataset.heat)
      }
    })
  }
})

document.querySelector('button#calibSave').addEventListener("click", function(event){
  console.log(calibChart.data.datasets[0].data)
  console.log(calibChart.data.datasets[1].data)
})

document.querySelectorAll('form#calibPoints input[type="radio"][name="index"]').forEach((p) => {
  p.addEventListener("change", function(event){
    if ( document.querySelector('button#calibSwitch').dataset.state == "1" && this.checked ){
      calibIndex = this.value
      console.log(this.dataset.heat)
      exec("heat "+this.dataset.heat)
    }
  })
})

document.querySelector('form#calibPoints div:first-child input[type="radio"]').checked = 'true'

document.querySelectorAll('form#calibPoints input[type="number"]').forEach((p) => {
  p.addEventListener("change", function(event){

    document.querySelector('form#calibPoints input[type="radio"][value="'+this.dataset.index+'"]').dataset.heat = this.value

    if ( document.querySelector('button#calibSwitch').dataset.state == "1" 
      && document.querySelector('form#calibPoints input[type="radio"][value="'+this.dataset.index+'"]').checked )
    {
      console.log(this.value)
      exec("heat "+this.value)
    }

    calibChart.data.labels[this.dataset.index] = this.value

    calibChart.update('none')

  })
})
