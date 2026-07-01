# Despliegue de PokemonGallery en un VPS

Esta guía describe el despliegue automático de PokemonGallery en
`https://pokemongallery.kity.dev` usando Podman Compose, Caddy, SQL Server y GitHub Actions.

## Arquitectura

La plataforma se divide en dos repositorios:

```text
VpsInfrastructure
  ├── Caddy (puertos públicos 80 y 443)
  ├── SQL Server (solo red privada)
  └── red Podman vps_shared

PokemonGallery
  ├── pokemongallery-frontend
  ├── pokemongallery-backend
  └── db-init (se ejecuta y termina durante el deploy)
```

Separar la infraestructura evita que desplegar una aplicación reinicie la base o el proxy de
las demás. No se instala Podman dentro de un contenedor: Podman se instala en Ubuntu y administra
los contenedores. Kubernetes no aporta una ventaja práctica para este VPS único.

## 1. DNS de kity.dev

Conserva los nameservers en el proveedor donde compraste el dominio y crea:

```dns
Tipo  Nombre  Valor
A     @       IP_PUBLICA_DEL_VPS
A     *       IP_PUBLICA_DEL_VPS
```

No agregues un registro `AAAA` si el VPS no tiene IPv6 configurado. El registro wildcard hace que
todo subdominio llegue al VPS; Caddy decide cuáles existen realmente. Un nombre no incluido en los
archivos de `VpsInfrastructure/sites` no publica ninguna aplicación.

Los puertos TCP 80 y 443 y UDP 443 deben estar abiertos. El puerto 1433 no debe abrirse. Caddy
obtiene y renueva certificados automáticamente cuando el DNS ya apunta al VPS.

## 2. Repositorio VpsInfrastructure

El scaffold local se encuentra junto a este repositorio, en `../VpsInfrastructure`. Crea un
repositorio privado vacío llamado `cristinakity/VpsInfrastructure` y publícalo:

```bash
cd ../VpsInfrastructure
git remote add origin https://github.com/cristinakity/VpsInfrastructure.git
git add .
git commit -m "Add shared VPS infrastructure"
git push -u origin master
```

Su Compose crea Caddy, SQL Server 2022 Express, los volúmenes persistentes y `vps_shared`. También
crea `PokemonesDB` y dos credenciales:

- `pokemongallery_migrator`: crea o actualiza tablas y seeds durante el deploy.
- `pokemongallery_app`: acceso runtime utilizado por el backend.

`sa` solo existe en este repositorio. Si Apache estaba instalado por una configuración anterior,
el workflow lo deshabilita para liberar los puertos 80 y 443; Webmin puede continuar en su puerto.

## 3. GitHub Environment de infraestructura

En `VpsInfrastructure`, crea un environment llamado `production`.

Variables:

| Nombre            | Ejemplo                                              |
| ----------------- | ---------------------------------------------------- |
| `VPS_HOST`        | `107.175.127.201`                                    |
| `VPS_USER`        | `root`                                               |
| `VPS_SSH_PORT`    | `22`                                                 |
| `VPS_KNOWN_HOSTS` | Salida completa de `ssh-keyscan` validada localmente |
| `APP_DOMAIN`      | `pokemongallery.kity.dev`                            |

Secrets:

| Nombre                             | Uso                                   |
| ---------------------------------- | ------------------------------------- |
| `VPS_SSH_KEY`                      | Llave privada que puede entrar al VPS |
| `DB_SA_PASSWORD`                   | Administración de la instancia SQL    |
| `POKEMONGALLERY_DB_PASSWORD`       | Login runtime `pokemongallery_app`    |
| `POKEMONGALLERY_MIGRATOR_PASSWORD` | Login de migraciones                  |

Genera contraseñas diferentes con `openssl rand -base64 48`. En esta implementación no deben
contener comillas, espacios ni `$`; el workflow valida el formato antes del deploy.

Obtén `VPS_KNOWN_HOSTS` desde una conexión confiable, comprobando el fingerprint del VPS:

```bash
ssh-keyscan -p 22 107.175.127.201
```

Ejecuta primero `Deploy VPS infrastructure`. El primer arranque de SQL puede tardar varios minutos.

## 4. GitHub Environment de PokemonGallery

En este repositorio crea también el environment `production`.

Variables:

| Nombre               | Valor                                      |
| -------------------- | ------------------------------------------ |
| `VPS_HOST`           | La IP o hostname del VPS                   |
| `VPS_USER`           | `root`                                     |
| `VPS_SSH_PORT`       | `22` o el puerto configurado               |
| `VPS_KNOWN_HOSTS`    | El mismo valor validado de infraestructura |
| `APP_DOMAIN`         | `pokemongallery.kity.dev`                  |
| `JWT_ISSUER`         | `BackendPokemon`                           |
| `JWT_AUDIENCE`       | `AngularPokemon`                           |
| `INITIAL_ADMIN_USER` | Usuario inicial de la aplicación           |

Secrets:

| Nombre                             | Uso                                                              |
| ---------------------------------- | ---------------------------------------------------------------- |
| `VPS_SSH_KEY`                      | Llave privada SSH                                                |
| `GHCR_READ_TOKEN`                  | PAT con permiso `read:packages` para descargar imágenes privadas |
| `POKEMONGALLERY_DB_PASSWORD`       | Exactamente el mismo valor que en infraestructura                |
| `POKEMONGALLERY_MIGRATOR_PASSWORD` | Exactamente el mismo valor que en infraestructura                |
| `JWT_KEY`                          | Llave aleatoria larga para firmar JWT                            |
| `INITIAL_ADMIN_PASSWORD`           | Password inicial de la aplicación                                |

El backend recibe únicamente esta conexión:

```text
Server=sqlserver,1433;Database=PokemonesDB;User Id=pokemongallery_app;Password=...;Encrypt=True;TrustServerCertificate=True;
```

La variable .NET conserva el nombre histórico `ConnectionStrings__PokemonConection`.

## 5. Deploy automático

Cada push a `master` realiza:

1. Instalación de dependencias, pruebas y build de Angular.
2. Build Release de .NET.
3. Build de imágenes OCI y push privado a GHCR con tags `latest` y SHA del commit.
4. Copia del Compose y scripts al VPS mediante SSH.
5. Ejecución idempotente del esquema y seeds de `PokemonesDB`.
6. Recreación de frontend/backend con el tag SHA.
7. Prueba interna del backend y comprobación pública de HTTPS.

También puede ejecutarse manualmente desde GitHub Actions. Los deploys concurrentes están
serializados para impedir que dos commits modifiquen producción a la vez.

## Operación y troubleshooting

```bash
ssh root@IP_DEL_VPS

cd /opt/platform
podman-compose --env-file .env ps
podman logs vps-caddy --tail=200
podman logs sqlserver --tail=200

cd /opt/apps/PokemonGallery
podman-compose --env-file .env ps
podman logs pokemongallery-backend --tail=200
podman logs pokemongallery-frontend --tail=200
```

Si el servidor dispone del subcomando moderno, `podman compose` puede sustituir a
`podman-compose`.

Comprueba que SQL no esté publicado:

```bash
podman port sqlserver
ss -lntup
```

`podman port sqlserver` no debe mostrar `1433` en el host.

## Persistencia, backup y rotación

Los volúmenes `vps_sqlserver_data`, `vps_caddy_data` y `vps_caddy_config` sobreviven a recreaciones
de contenedores. No ejecutes `podman volume rm` ni `podman compose down -v` en producción.

Un volumen no reemplaza un backup. Para crear una copia manual de `PokemonesDB`:

```bash
cd /opt/platform
set -a && . ./.env && set +a
podman exec -e SQLCMDPASSWORD="$DB_SA_PASSWORD" sqlserver \
  /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -C -b \
  -Q "BACKUP DATABASE [PokemonesDB] TO DISK=N'/var/opt/mssql/data/PokemonesDB.bak' WITH INIT, CHECKSUM"
podman cp sqlserver:/var/opt/mssql/data/PokemonesDB.bak ./PokemonesDB.bak
chmod 600 ./PokemonesDB.bak
```

Copia después el `.bak` a almacenamiento externo al VPS.

SQL Server ignora un `DB_SA_PASSWORD` nuevo cuando reutiliza un volumen existente. Para rotarlo,
ejecuta primero `ALTER LOGIN [sa] WITH PASSWORD = 'nuevo-password'`, comprueba el acceso y actualiza
el secret. El workflow de infraestructura sí sincroniza automáticamente los passwords de los
logins de PokemonGallery.

## Rollback

Las imágenes quedan etiquetadas con el SHA del commit. Para volver a una versión anterior, cambia
`BACKEND_IMAGE` y `FRONTEND_IMAGE` en `/opt/apps/PokemonGallery/.env` al SHA deseado y ejecuta:

```bash
cd /opt/apps/PokemonGallery
podman-compose --env-file .env pull backend frontend
podman-compose --env-file .env up -d backend frontend
```

Los cambios de esquema deben seguir siendo compatibles hacia atrás antes de hacer rollback.

## Agregar otra aplicación

1. Añade su bloque de dominio en `VpsInfrastructure/sites`.
2. Añade a la infraestructura un script que cree su base, migrador y login runtime.
3. Conecta su Compose a la red externa `vps_shared`.
4. Usa `sqlserver` como hostname, nunca `localhost` ni una IP pública.
5. Despliega infraestructura y después la nueva aplicación.

No es necesario crear otro SQL Server salvo que la aplicación necesite otra versión, aislamiento
de recursos o requisitos de seguridad independientes.
