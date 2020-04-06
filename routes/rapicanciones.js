module.exports = function(app, gestorBD) {
    app.get("/api/cancion", function (req, res) {
        gestorBD.obtenerCanciones({}, function (canciones) {
            if (canciones == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send(JSON.stringify(canciones));
            }
        });
    });

    app.delete("/api/cancion/:id", function (req, res) {

        var criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)}
        gestorBD.eliminarCancion(criterio, function (canciones) {
            if (canciones == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send(JSON.stringify(canciones));
            }
        });
    });
    app.post("/api/cancion", function (req, res) {
        var cancion = {
            nombre: req.body.nombre,
            genero: req.body.genero,
            precio: req.body.precio,
        }
        gestorBD.insertarCancion(cancion, function (id) {
            if (id == null) {
                res.status(500);
                res.json({error: "se ha producido un error"})
            } else {
                validaCancion(cancion, function(msg){
                    if(msg == null){
                        res.status(201);
                        res.json({mensaje: "canción insertarda", _id: id})
                    }
                    else{
                        res.json({error: msg})
                        res.status(500);
                    }
                });
            }
        });
    });
    app.put("/api/cancion/:id", function(req, res) {
        var criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id) };
        var cancion = {}; // Solo los atributos a modificar
        if ( req.body.nombre != null)
            cancion.nombre = req.body.nombre;
        if ( req.body.genero != null)
            cancion.genero = req.body.genero;
        if ( req.body.precio != null)
            cancion.precio = req.body.precio;
        gestorBD.modificarCancion(criterio, cancion, function(result) {
            if (result == null) {
                res.status(500);
                res.json({ error : "se ha producido un error" })
            } else {
                res.status(200);
                res.json({ mensaje : "canción modificada", _id : req.params.id }) }
        });
    });
    app.post("/api/autenticar/", function(req, res) {
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave')) .update(req.body.password).digest('hex');
        var criterio = {
            email : req.body.email, password : seguro
        }
        gestorBD.obtenerUsuarios(criterio, function(usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                res.status(401); res.json({autenticado : false })
            } else {
                var token = app.get('jwt').sign( {usuario: criterio.email , tiempo: Date.now()/1000}, "secreto");
                res.status(200); res.json({ autenticado: true, token : token });
            }
        });
    });

    function validaCancion(cancion, callback) {
        if (cancion.nombre == null || cancion.genero == null || cancion.precio == null || cancion.precio < 0) {
            callback("Error en la canción");
        }
        else{
            callback(null);
        }

    };
}