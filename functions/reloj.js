import { secondsToHHMMSS } from "../utils/time.js";

//funciones de el reloj
export function mostrar_configuracion() {
  let form_clock = document.querySelector(".overlay");
  form_clock.style.display = "flex";
}

export function restart_clock() {

  stop_clock(); // Detenemos el intervalo para que no siga con la marcha atras

  // Con la variable datos guardados realizamos la lectura de la configuracion actual que el usuario guardo previamente
  const datosGuardados = localStorage.getItem("cycles")
  let clock = document.querySelector(".clock_timer_main");

  if(datosGuardados){
    const data = JSON.parse(datosGuardados);

    if(data.cycle && data.cycle.length > 0){
      clock.textContent = secondsToHHMMSS(data.cycle[0]);
    }else{
      clock.textContent = "00:00:00";
    }
  }else{
    clock.textContent = "00:00:00";
  }
}

export async function run_clock() {
  let data = JSON.parse(localStorage.getItem("cycles"));
  let repeats = data.repeat;
  let cycles = data.cycle;

  for (let repeat = 0; repeat < repeats; repeat++) {
    for (let cycle = 0; cycle < cycles.length; cycle++) {
      await run_timer(cycles[cycle]);
    }
  }
}
let intervalo;
export function run_timer(seconds) {
  let clock = document.querySelector(".clock_timer_main");

  // Añadimos una nueva variable
  let body = document.body;

  return new Promise((resolve) => {
    let time = seconds;

    intervalo = setInterval(() => {
      if (time <= 0) {
        clock.textContent = `00:00:00`;
        clearInterval(intervalo);
        
        const datosGuardados = localStorage.getItem("cycles");
        let tipoAlarma = 2;

        if(datosGuardados){
          const data = JSON.parse(datosGuardados);
          if(data.alarmType !== undefined){
            tipoAlarma = Number(data.alarmType);
          }
        }

        // Disparamos la transicion sonora en el body
        ejecutarAlarmaInmersiva(tipoAlarma, body);

        resolve("terminó");
      }
      clock.textContent = secondsToHHMMSS(time);
      time--;
    }, 1000);
  });
}

// Instancias de los archivos MP3
const pistasAlarma = {
  1: new Audio ('sounds/zen.mp3'),
  2: new Audio ('sounds/normal.mp3'),
  3: new Audio ('sounds/fuerte.mp3')
};

// Aqui abajo añadimos una funcion asistente/coopera a la que ya esta realizando el conteo hacia atras que se encargara
// de añadir el audio de la alarma
function ejecutarAlarmaInmersiva(tipo, elementoBody) {
  // Reseteamos cualquier pista de audio la cual estubiera sonando previamente
  Object.values(pistasAlarma).forEach(audio => {
    audio.pause(); // Aqui detenemos la pista de audio
    audio.currentTime = 0;
  });

  // Aqui obtenemos la pista de audio correspondiente
  const audioSeleccionado = pistasAlarma[tipo] || pistasAlarma[2];

  // Reproduciremos el archivo mp3
  audioSeleccionado.play().catch(error => {
    console.log("La reproduccion de audio fue bloqueada por el navegador hasta una interaccion del usuario. ", error);
  });

  if(tipo === 1){
    elementoBody.classList.add("flash-zen");
    setTimeout(() => elementoBody.classList.remove("flash-zen"), 4000);
  }else if(tipo === 3){
    elementoBody.classList.add("flash-alert");
    setTimeout(() => elementoBody.classList.remove("flash-alert"), 2500);
  }
}

export function reproducirVistaPreviaAlarma(tipo){
  Object.values(pistasAlarma).forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });

  const audioVistaPrevia = pistasAlarma[tipo] || pistasAlarma[2];

  audioVistaPrevia.play().catch(e => console.log("Bloqueo de audio: ", e));

  setTimeout(() => {
    if(document.querySelector(".overlay").style.display === "flex"){
      audioVistaPrevia.pause();
      audioVistaPrevia.currentTime = 0;
    }
  }, 1500);
}

export function habilitarAudios(){
  Object.values(pistasAlarma).forEach(audio => {
    audio.play().then(() => {
      audio.pause();
      audio.currentTime = 0;
    }).catch(e => console.log("Audios listos para reproducirse mas tarde."));
  });
}

export function localStorage_cycles() {
  console.log(localStorage.getItem("cycles"));
}

export function stop_clock() {
  clearInterval(intervalo);
}
