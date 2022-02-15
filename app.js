var express = require('express');
var exphbs = require('express-handlebars');
const req = require('express/lib/request');
var bodyParser = require('body-parser');
var port = process.env.PORT || 3001

// SDK de Mercado Pago
const mercadopago = require("mercadopago");
// Agrega credenciales
mercadopago.configure({
  access_token: "APP_USR-6317427424180639-042414-47e969706991d3a442922b0702a0da44-469485398",
  integrator_id: "dev_24c65fb163bf11ea96500242ac130004"
});
mercadopago.configurations.setAccessToken("APP_USR-6317427424180639-042414-47e969706991d3a442922b0702a0da44-469485398");



var app = express();

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.static('assets'));

app.use('/assets', express.static(__dirname + '/assets'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function (req, res) {
  res.render('home' )
});
app.get('/detail', function (req, res) {
  res.render('detail', req.query);
})
app.post('/detail', function (req, res) {
  // Crea un objeto de preferencia
  let preference = {
    items: [
      {
        id: 1234,
        title: req.body.title,
        description: "Dispositivo móvil de Tienda e-commerce",
        url_image: req.body.image,
        unit_price: req.body.price,
        quantity: 1,
      },
    ],
    external_reference: "tamiisoledad4@gmail.com",
    payer: {
      name: "Lalo",
      surname: "Landa",
      email: "test_user_63274575@testuser.com",
      phone: {
        area_code: "11",
        number: 22223333
      },
      identification: {
        type: "DNI",
        number: "12345678"
      },
      address: {
        street_name: "Falsa",
        street_number: 123,
        zip_code: "1111"
      }
    },
    back_urls: {
      "success": "https://tamiisoledad-mp-commerce-node.herokuapp.com/success",
      "failure": "https://tamiisoledad-mp-commerce-node.herokuapp.com/failure",
      "pending": "https://tamiisoledad-mp-commerce-node.herokuapp.com/pending"
    },
    auto_return: "approved",
    payment_methods: {
      excluded_payment_methods: [
        {
          "id": "amex"
        },

      ],
      installments: 6
    },
    notification_url: "https://tamiisoledad-mp-commerce-node.herokuapp.com/notification?source_news=webhooks"
    

  };

  
  mercadopago.preferences
    .create(preference)
    .then(function (response) {
      res.redirect(response.body.init_point)

    })
    .catch(function (error) {
      console.log(error);
    });

});
app.get('/success', function (req, res) {
  res.render('success', req.query)
})
app.get('/pending', function (req, res) {
  res.render('pending', req.query);
})
app.get('/failure', function (req, res) {
  res.render('failure', req.query);
})
app.get('/notification', function (req, res) {
  console.log('get noti')
  res.render('notification')
})
 app.post('/notification', function (req, res) {
   console.log(req.body)
   
   var payment_data = {
    transaction_amount: Number(req.body.transactionAmount),
    token: req.body.token,
    description: req.body.description,
    installments: Number(req.body.installments),
    payment_method_id: req.body.paymentMethodId,
    issuer_id: req.body.issuer,
    notification_url: "https://tamiisoledad-mp-commerce-node.herokuapp.com/notification?source_news=webhooks",
    payer: {
      email: req.body.email,
      identification: {
        type: req.body.docType,
        number: req.body.docNumber
      }
    }
  };
  const {type,data} = req.body;
  let payment;
   switch (type) {
    case "payment":
      
      payment = mercadopago.payment.search(data.id)
      break;
    }

  mercadopago.payment.save(payment_data)
    .then(function (response) {
      res.status(response.status).json({
        status: response.body.status,
        status_detail: response.body.status_detail,
        id: response.body.id
      });
     
    })
    .catch(function (error) {
      res.status(response.status).send(error);
    });
  
}) 
app.listen(port);