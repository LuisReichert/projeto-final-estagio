 // importando os pacotes para uso no arquivo express.js
//sempre declarar as bibliotecas no inicio
//require do express é: a variavel express, requer(exige) o express da biblioteca pra funcionar
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const { readFileSync } = require('fs'); 
const { Client } = require('ssh2');

// crio um servidor express
// criando a variavel app pra receber o servidor 
const app = express();

// aplico configurações para dentro do servidor express, adicionando middlewares (body-parser, morgan, cors)
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// DB local (tempo de execução)
const data = [];

// criação de rota que será acessada utilizando o método HTTP GET/
// http://localhost:9000/
app.get('/', (req, res) => {
  return res.json({ data });
  
});

// criação de rota que será acessada utilizando o método HTTP POST/
// http://localhost:9000/add
// /add é pra mostrar q é adicionar no post - req:o que o ususaio manda pra máquina - res o que a máquina manda de volta
app.post('/add', (req, res) => {
  //criando a variavel result que recebe o que o usuário coloca no postman
  const result = req.body;

  //variável pra fazer alguma coisa dentro da máquina, no caso o uptime
  var comando = 'uptime'

  //variavel conn pra conectar no cliente novo pelo SSH2
  const conn = new Client();
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
        console.log('Up time: ' + data);
        res.send( data );
        //stderr pra caso ocorra erro no processo
      }).stderr.on('data', (data) => {
        console.log('STDERR: ' + data);
      });
    });
     //.connect pra conectar na máquina virtual
  }).connect({
    //host do connect vai mostrar o resultado do host que o usuário digitar
    host: result.host,
    port: result.port,
    username: result.username,
    password: result.password,
    });
    });
// o servidor irá rodar dentro da porta 9000
app.listen(9000, () => console.log('Express started at http://localhost:9000'));

// .on nesse caso geral é: quando algo acontece ele faz algo
//stream.on(close) seria quando ele fechar, ele executa o console.log debaixo


