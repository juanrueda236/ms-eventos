# Parcial 3 · Redes y Servicios Multimedia

Repositorio de trabajo de la pareja para la preparación y evaluación del Módulo 3 de **Redes y Servicios Multimedia** de la Universidad Autónoma de Occidente.

**Microservicio asignado:** `ms-eventos` (entidad n.º 2)  
**Repositorio:** https://github.com/juanrueda236/ms-eventos

> Este repositorio contiene el microservicio asignado, el microservicio de usuarios usado para autenticación y la documentación de preparación. La integración con el microservicio proveedor se realizará durante el examen, cuando se entregue su código y ficha.

## Integrantes

### Integrante 1 — Juan Pablo Rueda

- GitHub: [@juanrueda236](https://github.com/juanrueda236)
- Aportes: preparación inicial del repositorio y de la infraestructura de las máquinas virtuales; configuración y validación de DNS, MySQL, firewall, Apache y `ms-usuarios`; preparación inicial de `ms-eventos` y de la colección de Postman.

### Integrante 2 — Valeria

- Nombre completo: Valeria POlanco muñoz
- GitHub:@val-polanco
- Aportes y actividades realizadas:
  -Preparacion de ms-Usuarios
  -
  -

> Valeria debe completar esta sección con sus datos y describir únicamente las actividades y contribuciones que haya realizado, asociándolas con sus commits.

## 1. Microservicio asignado: `ms-eventos`

El servicio administra eventos y se ejecuta localmente en el puerto **3011**, escuchando en `127.0.0.1`.

### Modelo de datos

| Campo | Tipo / regla |
|---|---|
| `id` | Identificador autoincremental |
| `codigo` | Texto obligatorio y único. Si ya existe, responder `409 Conflict`. |
| `nombre` | Texto obligatorio |
| `fecha` | Fecha con formato `AAAA-MM-DD` |
| `asistentes_esperados` | Entero mayor que cero |
| `tipo` | Uno de estos valores: `conferencia`, `taller` o `feria` |

Filtro disponible: `GET /eventos?tipo=taller` (también admite `conferencia` y `feria`).

El modelo inicial no incluye campos de referencia a otro microservicio ni atributos terminados en `_id`. La relación con el proveedor se construirá durante el examen.

### Contrato HTTP

Todas las rutas requieren un token válido de `ms-usuarios`.

| Método | Ruta | Uso | Respuesta esperada |
|---|---|---|---|
| `GET` | `/eventos` | Listar eventos | `200 OK` |
| `GET` | `/eventos/:id` | Consultar un evento | `200 OK` o `404 Not Found` |
| `GET` | `/eventos?tipo=:tipo` | Filtrar por tipo | `200 OK` |
| `POST` | `/eventos` | Crear un evento | `201 Created` |
| `PUT` | `/eventos/:id` | Actualizar un evento | `200 OK` o `404 Not Found` |
| `DELETE` | `/eventos/:id` | Eliminar un evento | `204 No Content` o `404 Not Found` |

Errores contemplados:

- `400 Bad Request`: datos inválidos, campos obligatorios ausentes o reglas de validación incumplidas.
- `404 Not Found`: identificador inexistente.
- `409 Conflict`: valor `codigo` duplicado.

### Autorización

- Todas las rutas exigen autenticación mediante token.
- Los usuarios autenticados pueden ejecutar solicitudes `GET`.
- Las operaciones `POST`, `PUT` y `DELETE` requieren el rol `administrador`.
- No se deben publicar contraseñas, tokens JWT ni archivos `.env`.

## 2. Arquitectura y base de datos

El microservicio debe conservar la arquitectura en capas utilizada en el módulo:

`routes → controller → service → repository`

Incluye también el modelo de dominio, el manejo centralizado de errores (`HttpError`) y el middleware de autenticación compatible con `ms-usuarios`.

- Base de datos local: `eventos_db`.
- Script de creación y datos iniciales: `ms-eventos/db/schema.sql`.
- El esquema debe incluir al menos tres eventos iniciales.
- El servicio debe registrar en la terminal cada petición recibida, mostrando método, ruta y código de respuesta.

## 3. Estructura esperada del repositorio

```text
.
├── ms-eventos/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── models/
│   │   ├── middlewares/
│   │   └── utils/
│   ├── db/
│   │   └── schema.sql
│   ├── docs/
│   │   └── ms-eventos.postman_collection.json
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
├── ms-usuarios/
├── .gitignore
└── README.md
```

La estructura puede ajustarse a las convenciones reales de `ms-usuarios`, siempre que se mantenga la separación por capas exigida.

## 4. Preparación y ejecución local

Requisitos en el PC de cada integrante:

- Node.js `22.9` o superior.
- MySQL 8.
- Git y Postman.
- `ms-usuarios` disponible localmente en el puerto `3001`.
- `ms-eventos` disponible localmente en `http://127.0.0.1:3011`.

Desde la carpeta `ms-eventos`, una vez creado el proyecto y configurado el archivo `.env` local:

```bash
npm install
npm start
```

El archivo `.env` contiene configuración local y **no se versiona**. Se puede publicar `.env.example` con nombres de variables y valores de ejemplo no sensibles. `node_modules/` tampoco se incluye en Git; sí debe incluirse `package-lock.json`.

## 5. Pruebas con Postman

La colección de preparación debe quedar dentro de `ms-eventos/docs/`. Incluye el login de `ms-usuarios` y las solicitudes para verificar:

- Login y obtención de token JWT.
- Listado, filtro y consulta por identificador.
- Creación correcta (`201`).
- Código duplicado (`409`).
- Datos inválidos (`400`).
- Identificador inexistente (`404`).
- Actualización (`200`).
- Eliminación (`204`).

La colección compartida para la preparación utiliza variables para guardar el token y el identificador del evento de prueba. Después de ejecutarla, se debe revisar el resumen de resultados y conservar la evidencia.

## 6. Infraestructura de preparación

Las máquinas virtuales se preparan antes del examen usando las VMs del Módulo 2/Taller 3:

- **servidor1:** Bind9 con la zona `m3examen.com`, MySQL escuchando para servidor2 y reglas de firewall correspondientes.
- **servidor2:** Node.js 22, Git, `mysql-client`, usuario `nodeapps`, Apache con `proxy` y `proxy_http`, capacidad para servir una página estática y `ms-usuarios` como servicio `systemd` activo y habilitado.

### Límite de preparación: no desplegar `ms-eventos` en las VMs

Antes de iniciar el examen, `ms-eventos` debe funcionar en el PC de cada integrante, pero **no debe estar desplegado en las máquinas virtuales**. No se debe crear su base de datos de examen en servidor1, un servicio `systemd` para `ms-eventos` en servidor2 ni una ruta para este servicio en el gateway/host virtual.

La base `eventos_db` y las pruebas CRUD corresponden al entorno local de desarrollo. En las VMs se conserva la preparación requerida de DNS, MySQL, Apache y `ms-usuarios`, sin adelantar el despliegue del microservicio asignado.

## 7. Trabajo reservado para el examen

El proveedor y la ficha de integración se entregan al inicio de la evaluación. La relación entre microservicios se implementa durante el examen, no en esta preparación.

- **Persona 1 — Código:** agregar la referencia al proveedor en base de datos, modelo y contrato; validar la existencia del proveedor al crear y actualizar; implementar una regla de negocio dependiente del proveedor; y componer las respuestas con sus datos.
- **Persona 2 — Despliegue:** crear las bases de datos y usuarios restringidos en servidor1; desplegar los dos microservicios como servicios `systemd`; crear el host virtual con apellidos, la ruta `/api` y su registro DNS; servir el frontend entregado durante el examen; y bloquear desde Windows el acceso a puertos `300X` y `3306`.
- **Integración:** ejecutar los casos de prueba a través del host virtual del examen.

No se debe implementar por adelantado la relación con el proveedor, la regla nueva dependiente del proveedor, el host virtual del examen ni el frontend (que se entrega durante la evaluación).

## 8. Reglas del repositorio

- Mantener el repositorio público y trabajar en las ramas asignadas.
- Cada integrante debe aportar commits identificables con su propia cuenta de GitHub.
- Mantener `package-lock.json` versionado.
- No versionar `.env`, contraseñas, tokens, bases de datos locales ni `node_modules/`.
- Antes de hacer `git add`, revisar `git status` y el contenido que se va a incluir.

## Referencias de uso

- Repositorio: https://github.com/juanrueda236/ms-eventos
- API local de eventos: `http://127.0.0.1:3011`
- Login local de usuarios: `http://127.0.0.1:3001/usuarios/login`
