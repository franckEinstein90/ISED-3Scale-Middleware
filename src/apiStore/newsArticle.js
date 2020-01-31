
/*******************************************************************************
 * Franck Binard, ISED - 2020
 * FranckEinstein90 - franck.binard@canada.ca
 * Prototype Code - Canadian Gov. API Store middleware
 * Used for demos, new features, experiments
 * 
 * Production application code at: https://github.com/ised-isde-canada/apican
 * 
 * Application APICan
 * -------------------------------------
 *  newsArticles.js: manages news article posts 
 *
 *  Server setup
 ******************************************************************************/
"use strict"

/*****************************************************************************/
const moment = require('moment')
const uuidv4 = require('uuid/v4')
/*****************************************************************************/
const db = require('@server/db').appDatabase

class Article  {
    constructor({
        englishTitle, 
        englishText,
        frenchTitle,  
        frenchText, 
        status, 
        authors
    }){
        this.articleID = uuidv4()
        this.englishTitle = englishTitle
        this.frenchTitle = frenchTitle
        this.frenchText = frenchText
        this.englishText = englishText
        this.authors = authors
        this.status = status || "draft"
        this.dateCreated = moment().format()
    }
}

const storeArticle  = function( article ){
    db.insertInTable({
        table: 'tblNewsArticles', 
        values: article
    })
    .then(insertResult => {
        if(insertResult === 'ok'){
            return 200
        }
    })
}

const newsArticle = (function(){

    return {
        postNewArticle: function(req, res, next){
            //stores a new article in the apps database
            let newArticleData = {

            }
            let articleFields = [
                'authors', 'status',
                'englishTitle', 'englishText', 
                'frenchTitle', 'frenchText'
            ]
            articleFields.forEach(articleField => {
                if(req.body[articleField]){
                    newArticleData[articleField] = req.body[articleField]
                } else {
                    newArticleData[articleField] = null
                }
            })
            let article = new Article( newArticleData )
            res.send(storeArticle(article))
        },
        postPublishArticle: function(req, res, next){

        },
        getStoredArticles: function(req, res, next) {
            db.getAllTableRows({
                table: 'tblNewsArticles'
            })
            .then(fetchResults => {
                res.send(fetchResults)
            })
            //gets a complete list of stored articles
        }, 
        editArticle: function(req, res, next){

        },
        getUnpublishArticle: function(req, res, next) {

        },
        getPublishedArticles: function(req, res, next){

        }
    }
})()

module.exports = {
    newsArticle
}
