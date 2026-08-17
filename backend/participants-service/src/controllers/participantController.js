import { participantModel } from '../models/participantModel.js';
import { validateParticipantPayload, normalizeType } from '../utils/validation.js';
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

    const errors = validateParticipantPayload({ name, email, phone, type });
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join(' ; ') });
    }

    const existing = await participantModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Un participant avec l'adresse email '${email}' existe déjà`
      });
    }

    const participant = await participantModel.create({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : null,
      type: normalizeType(type)
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

    const payload = {
      name: req.body.name ?? existing.name,
      email: req.body.email ?? existing.email,
      phone: req.body.phone !== undefined ? req.body.phone : existing.phone,
      type: req.body.type ?? existing.type
    };

    const errors = validateParticipantPayload(payload);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join(' ; ') });
    }

    if (String(payload.email).toLowerCase() !== existing.email.toLowerCase()) {
      const emailCheck = await participantModel.findByEmail(payload.email);
      if (emailCheck) {
        return res.status(409).json({
          success: false,
          message: `L'email '${payload.email}' est déjà utilisé par un autre participant`
        });
      }
    }

    const updated = await participantModel.update(id, {
      name: String(payload.name).trim(),
      email: String(payload.email).trim().toLowerCase(),
      phone: payload.phone ? String(payload.phone).trim() : null,
      type: normalizeType(payload.type)
    });

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
