let DB;

// Selectores de la interfaz
const form = document.querySelector('form');
const nombreMascota = document.querySelector('#mascota');
const nombreCliente = document.querySelector('#cliente');
const telefono = document.querySelector('#telefono');
const fecha = document.querySelector('#fecha');
const hora = document.querySelector('#hora');
const sintomas = document.querySelector('#sintomas');
const citas = document.querySelector('#citas');
const headingAdministra = document.querySelector('#administra');


// Esperar por el DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Crear bases de datos
    let crearDB = window.indexedDB.open('citas', 1);

    // Si hay un error enviarlo a la consola
    crearDB.onerror = function (){
        console.info('hubo un error');
    }

    // Si todo esta bien mandar a la consola y asignar base de datos
    crearDB.onsuccess = function (){
        // console.info('Todo bien');

        // Asignar  la base de datos
        DB = crearDB.result;
        // console.info(DB);
        mostrarCitas();
    }

    // Este metodo solo corre una vez y es ideal para crear el Schema.
    crearDB.onupgradeneeded = function(e){
        // El evento es la misma base de datos
        let db = e.target.result;

        // Definir el objestStore, toma 2 parametros, el nombre de la base de datos y las opciones
        // Ketpath es el indice de la base de datos
        let objectStore = db.createObjectStore('citas', {keyPath: 'key', autoIncrement: true});

        // Crear los indices y campos de la base de datos, createIndex: 3 parametros, nombre, keypath y opciones
        objectStore.createIndex('mascota', 'mascota', {unique: false});
        objectStore.createIndex('cliente', 'mascota', {unique: false});
        objectStore.createIndex('telefono', 'mascota', {unique: false});
        objectStore.createIndex('fecha', 'mascota', {unique: false});
        objectStore.createIndex('hora', 'mascota', {unique: false});
        objectStore.createIndex('sintomas', 'mascota', {unique: false});

        console.log('base de datos creada y lista!!');
    }

    // cuando el formulario se envia
    form.addEventListener('submit', agregarDatos);

    function agregarDatos(e){
        e.preventDefault();
        
        const nuevaCita ={
            mascota: nombreMascota.value,
            cliente: nombreCliente.value,
            telefono: telefono.value,
            fecha: fecha.value,
            hora: hora.value,
            sintomas: sintomas.value
        }
        // console.log(nuevaCita);

        // En IndexDB se utilizan las transacciones
        let transaction = DB.transaction(['citas'], 'readwrite');
        let objectStore = transaction.objectStore('citas');
        // console.log(objectStore);
        let peticion = objectStore.add(nuevaCita);
        // console.log(peticion);

        peticion.onsuccess = () => {
            form.reset();
        }

        transaction.oncomplete = () => {
            // console.log('cita agregada');
            mostrarCitas();
        }

        transaction.onerror = () => {
            console.info('hubo un error');
        }
    }

    function mostrarCitas(){
        // Limpiar las citas anteriores
        while(citas.firstChild){
            citas.removeChild(citas.firstChild);
        }

        // Creamos un object store
        let objectStore = DB.transaction('citas').objectStore('citas');

        // Esto retorna una peticion
        objectStore.openCursor().onsuccess = function(e){
            // cursor se va a ubicar en el registro indicado para acceder a los datos
            let cursor = e.target.result;
            // console.info(cursor);

            if(cursor){
                let citaHTML = document.createElement('li');
                citaHTML.setAttribute('data-cita-id', cursor.value.key);
                citaHTML.classList.add('list-group-item');
                citaHTML.innerHTML = `
                    <p class="font-weight-bold"> Mascota: <span class="font-weight-normal">${cursor.value.mascota}</span></p>
                    <p class="font-weight-bold"> Cliente: <span class="font-weight-normal">${cursor.value.cliente}</span></p>
                    <p class="font-weight-bold"> Telefono: <span class="font-weight-normal">${cursor.value.telefono}</span></p>
                    <p class="font-weight-bold"> Fecha: <span class="font-weight-normal">${cursor.value.fecha}</span></p>
                    <p class="font-weight-bold"> Hora: <span class="font-weight-normal">${cursor.value.hora}</span></p>
                    <p class="font-weight-bold"> Sintomas: <span class="font-weight-normal">${cursor.value.sintomas}</span></p>
                `;
                // Boton de borrar
                const boton = document.createElement('button');
                boton.classList.add('borrar', 'btn', 'btn-danger');
                boton.innerHTML = '<span aria-hidden="true"> X </span> Borrar';
                boton.onclick = borrarCita;
                citaHTML.appendChild(boton);

                // append en el padre
                citas.appendChild(citaHTML);

                // consultar los proximos registros
                cursor.continue();
            } else {
                if(!citas.firstChild){
                    // cuando no hay registros
                    headingAdministra.textContent = 'Agrega Citas Para Comenzar';
                    let listado = document.createElement('p');
                    listado.classList.add('text-center');
                    listado.textContent = 'No Hay registros';
                    citas.appendChild(listado);
                } else {
                    headingAdministra.textContent = 'Administra Tus Citas';
                }
            }
        }
    }

    function borrarCita(e){
        let citaID = Number(e.target.parentElement.getAttribute('data-cita-id'));
        
        // En IndexDB se utilizan las transacciones
        let transaction = DB.transaction(['citas'], 'readwrite');
        let objectStore = transaction.objectStore('citas');
        // console.log(objectStore);
        let peticion = objectStore.delete(citaID);

        transaction.oncomplete = () => {
            e.target.parentElement.parentElement.removeChild(e.target.parentElement);
            console.info(`se elimino la cita con el ID ${citaID} `);

            if(!citas.firstChild){
                // cuando no hay registros
                headingAdministra.textContent = 'Agrega Citas Para Comenzar';
                let listado = document.createElement('p');
                listado.classList.add('text-center');
                listado.textContent = 'No Hay registros';
                citas.appendChild(listado);
            } else {
                headingAdministra.textContent = 'Administra Tus Citas';
            }
        }

    }

});
