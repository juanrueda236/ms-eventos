// =====================================================================
// CLIENTE HTTP de ms-auditorios, para el microservicio de eventos.
// Copie este archivo en ms-eventos/src/clients/ y COMPLÉTELO:
// la función pedir() ya está hecha; faltan las funciones que usan
// la validación, la regla de negocio y la composición.
// En el .env de ms-eventos:  AUDITORIOS_URL=http://127.0.0.1:3012
// =====================================================================
const HttpError = require('../utils/http-error');
const AUDITORIOS_URL = process.env.AUDITORIOS_URL;

// Hace una petición GET a ms-auditorios reenviando el token del usuario.
// Devuelve la respuesta de fetch, o null si ms-auditorios no respondió.
async function pedir(ruta, token) {
  try {
    return await fetch(`${AUDITORIOS_URL}${ruta}`, {
      headers: { Authorization: token },     // el token de la petición original
      signal: AbortSignal.timeout(3000),      // no esperar más de 3 segundos
    });
  } catch (error) {
    return null;                              // ms-auditorios caído o sin responder
  }
}

// Ejemplo de uso:
//   const respuesta = await pedir('/auditorios/3', token);
//   if (!respuesta) ...                   → ms-auditorios no respondió
//   if (respuesta.status === 404) ...     → no existe
//   const datos = await respuesta.json(); → el objeto (o el arreglo, con ?ids=)

module.exports = { pedir };
