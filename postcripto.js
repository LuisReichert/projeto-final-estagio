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

    const tabelas = sequelize.define('tabelas', {
    comando: {
        type: Sequelize.STRING
    },
    horario: {
        type: Sequelize.STRING
    },
    atividade: {
        type: Sequelize.STRING
    },
    usuarios: {
        type: Sequelize.STRING
    },
    cargamedia: {
        type: Sequelize.STRING
    },
    usuario:{
        type:Sequelize.STRING
    }
    
})

const tempos = sequelize.define('tempos', {
    comando: {
        type: Sequelize.STRING
    },
    resultado: {
        type: Sequelize.STRING
    },
})

const cadastros = sequelize.define('cadastros', {
    telefone: {
        type: Sequelize.STRING
    },
    username: {
        type: Sequelize.STRING
    },
    password: {
        type: Sequelize.STRING
    }
    });

    const login = sequelize.define('login', {
        
        username: {
            type: Sequelize.STRING
        },
        password: {
            type: Sequelize.STRING
        },
        token: {
            type: Sequelize.STRING
        },
        });



    
   // tabelas.sync({force:true})
    module.exports = {
        infos: infos,
       tempos: tempos,
       tabelas: tabelas,
        cadastros: cadastros,
        login: login

    }