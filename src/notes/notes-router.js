/* eslint-disable strict */
const path = require('path');
const express = require('express');
const xss = require('xss');
const logger = require('../logger');
const notesService = require('./notes-service');
const {getNotesValidationError} = require('./notes-validator');

const notesRouter = express.Router();
const bodyParser = express.json();

const serializeNote = note => ({
  id: note.id,
  name: xss(note.name),
  modified: note.modified,
  folder_id: note.folder_id,
  content: xss(note.content)
});

notesRouter
  .route('/')
  .get((req, res, next) => {
    notesService.getAllNotes(req.app.get('db'))
      .then(notes => {
        res.json(notes.map(serializeNote));
      })
      .catch(next);
  })

  .post(bodyParser, (req, res, next) => {
    const {name, folder_id, content} = req.body;
    const newNote = {name, folder_id, content};

    for (const field of ['name', 'folder_id', 'content']) {
      if(!newNote[field]) {
        logger.error(`${field} is required`);
        return res.status(400).send({
          error: {message: `'${field}' is required`}
        });
      }
    }

    const error = getNotesValidationError(newNote);

    if(error) return res.status(400).send(error);

    notesService.insertNote(
      req.app.get('db'),
      newNote
    )
      .then(note => {
        logger.info(`Note with id ${note.id} created`);
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `${note.id}`))
          .json(serializeNote(note));
      })
      .catch(next);
  });

notesRouter
  .route('/:note_id')
  .all((req, res, next) => {
    const {note_id} = req.params;
    notesService.getById(
      req.app.get('db'),
      note_id
    )
      .then(note => {
        if(!note) {
          logger.error(`Note with id ${note_id} not found`);
          res.status(404).json({
            error: {message: 'Note not found'}
          });
        }
        res.note = note;
        next();
      })
      .catch(next);
  })

  .get((req, res) => {
    res.json(serializeNote(res.note));
  })

  .delete((req, res, next) => {
    const {note_id} = req.params;
    notesService.deleteNote(
      req.app.get('db'),
      note_id
    )
      // eslint-disable-next-line no-unused-vars
      .then(numRowsAffected => {
        logger.info(`note with id ${note_id} deleted`);
        res.status(204).end();
      })
      .catch(next);
  })

  .patch(bodyParser, (req, res, next) => {
    const {name, folder_id, content} = req.body;
    const noteUpdate = {name, folder_id, content};

    const numberOfValues = Object.values(noteUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      logger.error('Invalid update without required fields');
      return res.status(400).json({
        error: {
          message: 'Request body must content either \'name\', \'folder_id\', or \'content\''
        }
      });
    }

    const error = getNotesValidationError(noteUpdate);

    if (error) return res.status(400).send(error);

    notesService.updateNote(
      req.app.get('db'),
      req.params.note_id,
      noteUpdate
    )
      // eslint-disable-next-line no-unused-vars
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = notesRouter;