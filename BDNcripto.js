// // importando os pacotes para uso no arquivo index.js
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const tabela  = require('./postcripto.js');
const infos = tabela.infos;
const tempos = tabela.tempos;
const tabelas = tabela.tabelas;
const app = express();
const { readFileSync } = require('fs'); 
const { Client } = require('ssh2');
const bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(8);
var hash = bcrypt.hashSync("B4c0/\/", salt);


// aplico configurações para dentro do servidor express, adicionando middlewares (body-parser, morgan, cors)
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// criação de rota que será acessada utilizando o método HTTP POST/
// http://localhost:9000/add
app.post('/add', async(req, res) => {

  var host = req.body.host;
  var username = req.body.username;
  var password = req.body.password;
  var port = req.body.port;
  var hashPassword = await bcrypt.hash(password, 8)
  console.log(hashPassword);
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
  }).catch((err) => {
   console.log("erro " + err)
})

});



// o servidor irá rodar dentro da porta 9000
app.listen(9000, () => console.log('Express started at http://localhost:9000/' ));


//Middleware é o software de computador que fornece serviços para softwares aplicativos além daqueles disponíveis pelo sistema operacional.