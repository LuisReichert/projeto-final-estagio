// // importando os pacotes para uso no arquivo index.js
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const tabela  = require('./postcripto.js');
const infos = tabela.infos;
const tempos = tabela.tempos;
const cadastros = tabela.cadastros;
const login = tabela.login;
const tabelas = tabela.tabelas;
const app = express();
const { readFileSync } = require('fs'); 
const { Client } = require('ssh2');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSalt(8);
const jwt = require('jsonwebtoken');
const { nextTick } = require('process');
const SECRET  = ('Luis Reichert');

// aplico configurações para dentro do servidor express, adicionando middlewares (body-parser, morgan, cors)
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// criação de rota que será acessada utilizando o método HTTP GET/
// http://localhost:9000/
app.get('/', (req, res) => {
  res.json({ message: "tudo certo"});
  });

  //CLIENTES///////////////
  app.get('/clientes', verifyJWT, (req, res) => {
    console.log(req.username + ' fez esta chamada!');
    res.json ([{ id: 1, nome: 'Luis Reichert'}])
  })

  //CADASTROS///////////////
  app.post('/cadastro', async(req, res) => {

    var telefone = req.body.telefone;
    var username = req.body.username;
    var password = req.body.password;
    var hashPassword = await bcrypt.hash(password, 8);
    
    cadastros.create({
        telefone: telefone,
        username: username,
        password: hashPassword
      }).then(() => {
        res.send("criado com sucesso")
      }).catch((err) => {
       console.log("erro " + err)
    })

});

function verifyJWT(req, res, next){
    const token = req.headers['x-access-token']
    jwt.verify(token, SECRET, (err, decoded)=>{
        if (err) return res.status(401).end();
        req.username = decoded.username;
        next();
    })
}

//LOGIN///////////////
app.post('/login', async(req, res) => {
    const token = jwt.sign({username:'Luis Reichert'}, SECRET)

    var username = req.body.username;
    var password = req.body.password;
    var hashPassword = await bcrypt.hash(password, 8);
    
    login.create({
        username: username,
        password: hashPassword,
        token: token,
      }).then(() => {
        console.log("criado com sucesso")
      }).catch((err) => {
       console.log("erro " + err)
      })
    
    await cadastros.findAll({
       // attributes: ['username', 'password'],
        where: {
            username:req.body.username
        }
    })
    .then((result)=>{
        console.log(result[0].dataValues.password)
        bcrypt.compare(password, result[0].dataValues.password, (err, data) => {
           if (data) {
               res.send({mensagem: 'login realizado com sucesso', token:token})
           } else {
            res.send({mensagem: 'erro'})
           }
        })
    }).catch(()=>{
        return res.status(400).json({
            erro:true
        })
    })
})

// criação de rota que será acessada utilizando o método HTTP POST/
// http://localhost:9000/teste
app.post('/teste', verifyJWT, async (req, res) => {
    var username = req.body.username;
    var resultado = ''
    await login.findAll({
        // attributes: ['username', 'password'],
         where: {
        token:req.headers['x-access-token']
         }
     }).then((result)=>{
         resultado = result[0].dataValues.username
        //console.log(result)
     }).catch(()=>{
         return res.status(400).json({
             erro:true
         })
     })

//res.status(401).end();
  var host = req.body.host;
  var username = req.body.username;
  var password = req.body.password;
  var port = req.body.port;
  var hashPassword  = await bcrypt.hash(password, 8);
  //variavel conn pra conectar no cliente novo pelo SSH2
  const conn = new Client();
  var comando = 'uptime'
  conn.on('ready', () => {
    console.log('Client :: ready');
    //se der erro mostro esse erro
    conn.exec(comando, (erro, stream) => {
      if (erro) throw erro;
      //senao executa o código
      stream.on('close', (code, signal) => {
        console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
        conn.end();
        //conn.end pra terminar o processo
      }).on('data', (data) => {
        tabelas.create({
          comando: comando,
          horario: String(data).slice(0,7),
          atividade: String(data).slice(8,18),
          usuarios: String(data).slice(19,29),
          cargamedia: String(data).slice(30,62),
          usuario: resultado
        })

        //stderr pra caso ocorra erro no processo
      }).stderr.on('data', (data) => {
        console.log('STDERR: ' + data);
      });
    })
    
  }).connect({
    host: host,
    port:port,
    username: username,
    password: password
    });
  
  infos.create({
    host: host,
    port: port,
    username: username,
    password: hashPassword,
    
  }).then(() => {
    res.send("criado com sucesso")
    console.log('infos criado') 
  }).catch((err) => {
   console.log("erro " + err)
})
});

// o servidor irá rodar dentro da porta 9000
app.listen(9000, () => console.log('Express started at http://localhost:9000/' ));

//Middleware é o software de computador que fornece serviços para softwares aplicativos além daqueles disponíveis pelo sistema operacional.