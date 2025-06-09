
## Migration
When models evolve into typeorm, we need to find a way of updating them so that
the database reflects the defined entities.

To generate a migration

    npm run migration:generate <path/to/migrationDir/filename>

To apply a migration

    npm run migration:run

To revert a migration

    npm run migration:revert


