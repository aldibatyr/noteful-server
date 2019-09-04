/* eslint-disable strict */
const path = require('path');
const express = require('express');
const xss  = require('xss');
const logger = require('../logger');
const foldersService = require('./folders-service');

const foldersRouter = express.Router();
const bodyParser = express.json();

const serializeFolder = folder => ({
  id: folder.id,
  name: xss(folder.name)
})

foldersRouter
  .route('/')

  .get((req, res, next) => {
    foldersService.getAllFolders(req.app.get('db'))
      .then(folders => {
        res.json(folders.map(serializeFolder))
      })
      .catch(next)
  })

  .post(bodyParser, (req, res, next) => {
    const {name} = req.body;
    const newFolder = {name};

    if(!newFolder.name) {
      logger.error(`name is required`)
      return res.status(400).send({
        error: {message: `name is required`}
      })
    }
    foldersService.insertFolder(
      req.app.get('db'),
      newFolder
    )
      .then(folder => {
        logger.info(`Folder with id ${folder.id} created.`)
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `${folder.id}`))
          .json(serializeFolder(folder))
      })
      .catch(next)
  })

foldersRouter
  .route('/:folder_id')

  .all((req, res, next) => {
    const {folder_id} = req.params;
    foldersService.getById(
      req.app.get('db'),
      folder_id
    )
      .then(folder => {
        if (!folder) {
          logger.error(`Folder with id ${folder_id} not found.`)
          return res.status(404).json({
            error: {message: `Folder not found`}
          })
        }
        res.folder = folder
        next()
      })
      .catch(next)
  })

  .get((req, res) => {
    res.json(serializeFolder(res.folder))
  })

  .delete((req, res, next) => {
    const {folder_id} = req.params
    foldersService.deleteFolder(
      req.app.get('db'),
      folder_id
    )
      .then(numRowsAffected => {
        logger.info(`Folder with id ${folder_id} deleted.`)
        res.status(204).end()
      })
      .catch(next)
  })

  .patch(bodyParser, (req, res, next) => {
    const {name} = req.body
    const updateFolder = {name}
      
    if (!req.body.name) {
      logger.error(`Invalid update without required fileds`)
      return res.status(400).json({
        error: {message: `Request must have name field`}
      })
    }

    if(error) return res.status(400).send(error)

    foldersService.updateFolder(
      req.app.get('db'),
      req.params.folder_id,
      updateFolder
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = foldersRouter;