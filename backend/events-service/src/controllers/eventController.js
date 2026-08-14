import { eventModel } from '../models/eventModel.js';

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

    if (!title || !date || !location || !max_capacity) {
      return res.status(400).json({
        success: false,
        message: 'Les champs title, date, location et max_capacity sont obligatoires'
      });
    }

    if (isNaN(Number(max_capacity)) || Number(max_capacity) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'max_capacity doit être un nombre entier strictement positif'
      });
    }

    const event = await eventModel.create({
      title,
      description,
      date,
      location,
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

    const updated = await eventModel.update(id, req.body);
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
