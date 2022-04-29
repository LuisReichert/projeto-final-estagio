const Sequelize = require('sequelize')
const sequelize = new Sequelize('expressh', 'root', 'lgrs135792', {
    host:"localhost",
    dialect: 'mysql'
})

const infos = sequelize.define('infos', {
    host: {
        type: Sequelize.STRING
    },
    port: {
        type: Sequelize.INTEGER
    },
    username: {
        type: Sequelize.STRING
    },
    password: {
        type: Sequelize.STRING
    }
    });

    const tempos = sequelize.define('tempos', {
    comando: {
        type: Sequelize.STRING
    },
    resultado: {
        type: Sequelize.STRING
    },
})

    
    //tempos.sync({force:true})
    module.exports = {
        infos: infos,
        tempos: tempos
    }