/*******************************************************************************
 * Franck Binard, ISED
 * Canadian Gov. API Store middleware
 * -------------------------------------
 *  routingSystem.js
 *
 *  sets up the routing plumbing for the app
 ******************************************************************************/
"use strict"

const indexRouter = require('@routes/index')
const usersRouter = require('@routes/users')


const routingSystem = (function() {

    return {
        configure: function({
            app
        }) {

            app.use('/', indexRouter)
            app.use('/users', usersRouter)
            // catch 404 and forward to error handler
            app.use(function(req, res, next) {
                next(createError(404));
            })


            // error handler
            app.use(function(err, req, res, next) {
                // set locals, only providing error in development
                res.locals.message = err.message;
                res.locals.error = req.app.get('env') === 'development' ? err : {};

                // render the error page
                res.status(err.status || 500);
                res.render('error');
            });
        }
    }

})()

module.exports = {
    routingSystem
}