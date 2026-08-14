export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'EventHub - Service Inscriptions (registrations-service)',
    version: '1.0.0',
    description: 'API de gestion des inscriptions aux événements, annulations, vérification des capacités et statistiques.'
  },
  servers: [
    { url: 'http://localhost:3003', description: 'Serveur de Développement Local' }
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
    '/api/registrations': {
      post: {
        summary: 'Inscrire un participant à un événement',
        description: 'Vérifie d\'abord l\'existence du participant (via participants-service), l\'existence et la capacité restante de l\'événement (via events-service) avant d\'effectuer l\'inscription.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['event_id', 'participant_id'],
                properties: {
                  event_id: { type: 'integer', example: 1 },
                  participant_id: { type: 'integer', example: 1 }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Inscription réussie' },
          400: { description: 'Événement complet ou données invalides' },
          404: { description: 'Participant ou événement introuvable' },
          409: { description: 'Participant déjà inscrit à cet événement' }
        }
      }
    },
    '/api/registrations/{id}': {
      delete: {
        summary: 'Annuler une inscription par ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Inscription annulée avec succès' },
          404: { description: 'Inscription introuvable' }
        }
      }
    },
    '/api/registrations/event/{eventId}': {
      get: {
        summary: 'Lister toutes les inscriptions pour un événement',
        parameters: [
          { name: 'eventId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Liste des inscriptions de l\'événement' }
        }
      }
    },
    '/api/registrations/participant/{participantId}': {
      get: {
        summary: 'Lister toutes les inscriptions d\'un participant',
        parameters: [
          { name: 'participantId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Liste des inscriptions du participant' }
        }
      }
    },
    '/api/registrations/event/{eventId}/count': {
      get: {
        summary: 'Obtenir le nombre d\'inscrits actuel pour un événement',
        parameters: [
          { name: 'eventId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Nombre total d\'inscrits' }
        }
      }
    },
    '/api/registrations/stats': {
      get: {
        summary: 'Statistiques globales des inscriptions',
        responses: {
          200: { description: 'Statistiques (total global + total par événement)' }
        }
      }
    }
  }
};
