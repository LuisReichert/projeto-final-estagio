// // importando os pacotes para uso no arquivo index.js
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
//const Sequelize = require('sequelize');
const tabela  = require('./post.js');
const infos = tabela.infos;
const tempos = tabela.tempos;
const app = express();
const { readFileSync } = require('fs'); 
const { Client } = require('ssh2');

// aplico configurações para dentro do servidor express, adicionando middlewares (body-parser, morgan, cors)
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

//DB local (tempo de execução)
// const data = [];

// criação de rota que será acessada utilizando o método HTTP GET/
// http://localhost:9000/
// app.get('/', (req, res) => {
//   return res.json({ data });
// });

// criação de rota que será acessada utilizando o método HTTP POST/
// http://localhost:9000/add
app.post('/add', (req, res) => {

  var host = req.body.host;
  var username = req.body.username;
  var password = req.body.password;
  var port = req.body.port;

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
        tempos.create({
          comando: comando,
          resultado: String(data)
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
    password: password
  }).then(() => {
    res.send("criado com sucesso")
  }).catch((err) => {
   console.log("erro " + err)
})
  
});



// o servidor irá rodar dentro da porta 9000
app.listen(9000, () => console.log('Express started at http://localhost:9000/' ));


//Middleware é o software de computador que fornece serviços para softwares aplicativos além daqueles disponíveis pelo sistema operacional.