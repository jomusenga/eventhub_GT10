export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'EventHub - Service Participants (participants-service)',
    version: '1.0.0',
    description: 'API de gestion des profils participants (étudiants, professeurs, externes) du DIT.'
  },
  servers: [
    { url: 'http://localhost:3002', description: 'Serveur de Développement Local' }
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
    '/api/participants': {
      get: {
        summary: 'Lister et rechercher les participants',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Recherche par nom ou par email' }
        ],
        responses: {
          200: { description: 'Liste des participants récupérée' }
        }
      },
      post: {
        summary: 'Créer un nouveau participant',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'type'],
                properties: {
                  name: { type: 'string', example: 'Houleymatou Diallo' },
                  email: { type: 'string', example: 'houleymatou.diallo@dit.sn' },
                  phone: { type: 'string', example: '+221770000000' },
                  type: { type: 'string', enum: ['étudiant', 'professeur', 'externe'], example: 'étudiant' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Participant créé avec succès' },
          400: { description: 'Données invalides ou type non autorisé' },
          409: { description: 'Email déjà enregistré' }
        }
      }
    },
    '/api/participants/{id}': {
      get: {
        summary: 'Obtenir le profil d\'un participant par ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Participant trouvé' },
          404: { description: 'Participant introuvable' }
        }
      },
      put: {
        summary: 'Modifier le profil d\'un participant',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  phone: { type: 'string' },
                  type: { type: 'string', enum: ['étudiant', 'professeur', 'externe'] }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Profil mis à jour avec succès' },
          404: { description: 'Participant introuvable' }
        }
      },
      delete: {
        summary: 'Supprimer un participant',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Participant supprimé' },
          404: { description: 'Participant introuvable' }
        }
      }
    }
  }
};
