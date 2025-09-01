import express, { Request, Response } from 'express';
import { Note } from '../models/Note';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { noteSchema } from '../utils/validation';

const router = express.Router();

router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const notes = await Note.find({ userId: authReq.user._id })
      .sort({ createdAt: -1 })
      .select('title content createdAt updatedAt');

    res.status(200).json({ notes });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { error, value } = noteSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details?.[0]?.message || 'Validation error' });
    }

    const { title, content } = value;
    const authReq = req as AuthRequest;

    const note = new Note({
      title,
      content,
      userId: authReq.user._id
    });

    await note.save();

    res.status(201).json({
      message: 'Note created successfully',
      note: {
        id: note._id,
        title: note.title,
        content: note.content,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      }
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { error, value } = noteSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details?.[0]?.message || 'Validation error' });
    }

    const { title, content } = value;
    const { id } = req.params;
    const authReq = req as AuthRequest;

    const note = await Note.findOne({ _id: id, userId: authReq.user._id });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    note.title = title;
    note.content = content;
    await note.save();

    res.status(200).json({
      message: 'Note updated successfully',
      note: {
        id: note._id,
        title: note.title,
        content: note.content,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      }
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const authReq = req as AuthRequest;

    const note = await Note.findOneAndDelete({ _id: id, userId: authReq.user._id });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const authReq = req as AuthRequest;

    const note = await Note.findOne({ _id: id, userId: authReq.user._id })
      .select('title content createdAt updatedAt');

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.status(200).json({ note });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
