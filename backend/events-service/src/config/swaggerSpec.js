export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'EventHub - Service Événements (events-service)',
    version: '1.0.0',
    description: 'API de gestion des événements académiques et culturels du DIT.'
  },
  servers: [
    { url: 'http://localhost:3001', description: 'Serveur de Développement Local' }
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Vérification de santé du service',
        responses: {
          200: { description: 'Service fonctionnel' }
        }
      }
    },
    '/api/events': {
      get: {
        summary: 'Lister tous les événements',
        parameters: [
          { name: 'date', in: 'query', schema: { type: 'string' }, description: 'Filtre par date (YYYY-MM-DD)' },
          { name: 'location', in: 'query', schema: { type: 'string' }, description: 'Filtre par lieu' }
        ],
        responses: {
          200: { description: 'Liste des événements récupérée avec succès' }
        }
      },
      post: {
        summary: 'Créer un nouvel événement',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'date', 'location', 'max_capacity'],
                properties: {
                  title: { type: 'string', example: 'Conférence IA & DevOps DIT' },
                  description: { type: 'string', example: 'Présentation des architectures microservices' },
                  date: { type: 'string', format: 'date-time', example: '2026-08-20T10:00:00Z' },
                  location: { type: 'string', example: 'Amphi A - DIT Dakar' },
                  max_capacity: { type: 'integer', example: 100 }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Événement créé avec succès' },
          400: { description: 'Données invalides' }
        }
      }
    },
    '/api/events/{id}': {
      get: {
        summary: 'Détails d\'un événement par ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Événement trouvé' },
          404: { description: 'Événement non trouvé' }
        }
      },
      put: {
        summary: 'Modifier un événement',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  date: { type: 'string' },
                  location: { type: 'string' },
                  max_capacity: { type: 'integer' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Événement mis à jour' },
          404: { description: 'Événement non trouvé' }
        }
      },
      delete: {
        summary: 'Supprimer un événement',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Événement supprimé' },
          404: { description: 'Événement non trouvé' }
        }
      }
    },
    '/api/events/{id}/availability': {
      get: {
        summary: 'Vérifier la capacité d\'un événement',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Capacité retournée' },
          404: { description: 'Événement non trouvé' }
        }
      }
    }
  }
};
