import { eventModel } from '../models/eventModel.js';
import { validateEventPayload } from '../utils/validation.js';

export const getAllEvents = async (req, res, next) => {
  try {
    const { date, location } = req.query;
    const events = await eventModel.findAll({ date, location });
    res.json({ success: true, count: events.length, data: events });
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await eventModel.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, message: `Événement introuvable avec l'ID ${id}` });
    }
    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const { title, description, date, location, max_capacity } = req.body;

    const errors = validateEventPayload({ title, description, date, location, max_capacity });
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join(' ; ') });
    }

    const event = await eventModel.create({
      title: String(title).trim(),
      description: description ? String(description).trim() : '',
      date,
      location: String(location).trim(),
      max_capacity: parseInt(max_capacity, 10)
    });

    res.status(201).json({ success: true, message: 'Événement créé avec succès', data: event });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await eventModel.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: `Événement introuvable avec l'ID ${id}` });
    }

    const payload = {
      title: req.body.title ?? existing.title,
      description: req.body.description !== undefined ? req.body.description : existing.description,
      date: req.body.date ?? existing.date,
      location: req.body.location ?? existing.location,
      max_capacity: req.body.max_capacity ?? existing.max_capacity
    };

    const errors = validateEventPayload(payload);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join(' ; ') });
    }

    const updated = await eventModel.update(id, {
      title: String(payload.title).trim(),
      description: payload.description ? String(payload.description).trim() : '',
      date: payload.date,
      location: String(payload.location).trim(),
      max_capacity: parseInt(payload.max_capacity, 10)
    });

    res.json({ success: true, message: 'Événement mis à jour', data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await eventModel.delete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: `Événement introuvable avec l'ID ${id}` });
    }
    res.json({ success: true, message: 'Événement supprimé avec succès', data: deleted });
  } catch (error) {
    next(error);
  }
};

export const checkAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await eventModel.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, message: `Événement introuvable avec l'ID ${id}` });
    }

    res.json({
      success: true,
      data: {
        eventId: event.id,
        title: event.title,
        maxCapacity: event.max_capacity
      }
    });
  } catch (error) {
    next(error);
  }
};
