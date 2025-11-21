import { ReadingsModel } from "../models/readingsModel.js";

export const ReadingsController = {
  async list(req, res) {
    try {
      const data = await ReadingsModel.list();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async listWithDifference(req, res) {
    try {
      const data = await ReadingsModel.listWithDifference();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getStatistics(req, res) {
    try {
      const stats = await ReadingsModel.getStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getTopByDifference(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const data = await ReadingsModel.getTopReadingsByDifference(limit);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getByDateRange(req, res) {
    try {
      const { start_date, end_date } = req.query;
      
      if (!start_date || !end_date) {
        return res.status(400).json({ 
          error: "start_date and end_date query parameters are required" 
        });
      }

      const data = await ReadingsModel.getReadingsByDateRange(start_date, end_date);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async latest(req, res) {
    try {
      const data = await ReadingsModel.latest();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req, res) {
    try {
      const created = await ReadingsModel.create(req.body);
      res.status(201).json(created);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
};