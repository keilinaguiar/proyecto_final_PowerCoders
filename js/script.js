'use strict';
const reloj = document.querySelector('#header-date');
 //OBJETO PARA RECORRER LOS ELECTRODOMESTICOS
const MWH = {
    vajilla: 0.002508,
    ventilador: 0.000045,
    bombilla: 0.0001,
    acondicionado: 0.0035,
    plancha: 0.0011,
};
// FUNCION PARA PONER RELOJ
function actualizacion() {
    const now = new Date();

    reloj.textContent = `${now.toLocaleTimeString()}`;
}

actualizacion();
setInterval(actualizacion, 1000);

//SACAR LA INFORMACION DE LA API
function getAPI() {
    return fetch(
        'https://api.allorigins.win/get?url=https://api.preciodelaluz.org/v1/prices/all?zone=PCB'
    )
        .then((res) => res.json())
        .then((res) => {
            let { contents } = res;
            const date = new Date();

            localStorage.setItem('contents', contents);
            localStorage.setItem('time', date.getTime());

            return { contents, date };
        })
        .catch((error) => console.log(error));
}

//FUNCION COMPRUEBA SI LA INFORMACION ESTA EN EL LOCAL STORAGE Y SI HAN PASADO LOS 5 MINUTOS
function comprobarLocalStorage() {
    const time = localStorage.getItem('time');
    const contents = localStorage.getItem('contents');

    if (!time || !contents) {
        getAPI().then((data) => {
            console.log(data);
            getInfoHour(data.contents);
        });
    } else {
        const actualDate = new Date().getTime();
        const diference = actualDate - time;

        if (diference >= 300000) {
            getAPI().then((data) => {
                console.log(data);
                getInfoHour(data.contents);
            });
        } else {
            getInfoHour(contents);
        }
    }
}

comprobarLocalStorage();
setInterval(comprobarLocalStorage, 1000);

//SACAR LA INFORMACION DE LA HORA EN LA QUE ESTAMOS Y CAMBIARLA EN EL HTML
function getInfoHour(contents) {
    contents = JSON.parse(contents);
    const hours = new Date().getHours();

    let hoursText = hours;
    let nextHourText = hours + 1;

    if (hoursText < 10) hoursText = '0' + hours;
    if (nextHourText < 10) nextHourText = '0' + nextHourText;

    const key = `${hoursText}-${nextHourText}`;

    const { price } = contents[key];

    //MOSTRAMOS EL PRECIO ACTUAL
    const priceNow = document.querySelector("#priceNow");
    priceNow.textContent = `El precio actual es de: ${price}€ mwh`

    //FOR PARA CALCULAR EL PRECIO POR EL PRECIO DE LOS ELECTRODOMESTICOS
    for (const key in MWH) {
        const child = MWH[key];
        const element = document.querySelector(`#price-${key}`);
        const totalPrice = child * price;
        element.textContent = totalPrice.toFixed(3) + '€';
    }
}

//FUNCION QUE NOS DIGA LA MEJOR Y LA PEOR HORA DEL MWH
async function bestAndBad() {
    let contents = localStorage.getItem('contents');

    if (!contents) {
        await getAPI().then((data) => {
            contents = data.contents;
        });
    }

    contents = JSON.parse(contents);

    let min = 0;
    let max = 0;
    let minHour = '';
    let maxHour = '';

    for (let key in contents) {
        const child = contents[key];
        const { price } = child;

        if (price < min || min == 0) {
            min = price;
            minHour = key;
        }

        if (price > max) {
            max = price;
            maxHour = key;
        }
    }
     
    document.querySelector(
        '#min'
    ).textContent = `El rango de hora con el precio mas bajo es: ${minHour}, teniendo un precio de ${min}€ mwh`;

    document.querySelector(
        '#max'
    ).textContent = `El rango de hora con el precio más alto es: ${maxHour}, teniendo un precio de ${max}€ `;
}

bestAndBad();
