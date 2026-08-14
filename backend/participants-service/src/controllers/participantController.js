import { participantModel } from '../models/participantModel.js';

const VALID_TYPES = ['étudiant', 'professeur', 'externe'];

export const getAllParticipants = async (req, res, next) => {
  try {
    const { search } = req.query;
    const participants = await participantModel.findAll({ search });
    res.json({ success: true, count: participants.length, data: participants });
  } catch (error) {
    next(error);
  }
};

export const getParticipantById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const participant = await participantModel.findById(id);
    if (!participant) {
      return res.status(404).json({ success: false, message: `Participant introuvable avec l'ID ${id}` });
    }
    res.json({ success: true, data: participant });
  } catch (error) {
    next(error);
  }
};

export const createParticipant = async (req, res, next) => {
  try {
    const { name, email, phone, type } = req.body;

    if (!name || !email || !type) {
      return res.status(400).json({
        success: false,
        message: 'Les champs name, email et type sont obligatoires'
      });
    }

    if (!VALID_TYPES.includes(type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Le type doit être l'un des suivants: ${VALID_TYPES.join(', ')}`
      });
    }

    // Check duplicate email
    const existing = await participantModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Un participant avec l'adresse email '${email}' existe déjà`
      });
    }

    const participant = await participantModel.create({
      name,
      email,
      phone,
      type: type.toLowerCase()
    });

    res.status(201).json({ success: true, message: 'Participant créé avec succès', data: participant });
  } catch (error) {
    next(error);
  }
};

export const updateParticipant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await participantModel.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: `Participant introuvable avec l'ID ${id}` });
    }

    if (req.body.type && !VALID_TYPES.includes(req.body.type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Le type doit être l'un des suivants: ${VALID_TYPES.join(', ')}`
      });
    }

    if (req.body.email && req.body.email.toLowerCase() !== existing.email.toLowerCase()) {
      const emailCheck = await participantModel.findByEmail(req.body.email);
      if (emailCheck) {
        return res.status(409).json({
          success: false,
          message: `L'email '${req.body.email}' est déjà utilisé par un autre participant`
        });
      }
    }

    const updated = await participantModel.update(id, req.body);
    res.json({ success: true, message: 'Profil du participant mis à jour', data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteParticipant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await participantModel.delete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: `Participant introuvable avec l'ID ${id}` });
    }
    res.json({ success: true, message: 'Participant supprimé avec succès', data: deleted });
  } catch (error) {
    next(error);
  }
};
