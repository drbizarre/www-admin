/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.getProducts();

        var db = openDatabase('mydb', '1.0', 'Test DB', 10 * 1024 * 1024);
        db.transaction(function (tx) {

            tx.executeSql('CREATE TABLE IF NOT EXISTS cart (id unique, product_id,code, qty, description, price)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS sales (id,cliente, metodo, pagos, fechas, correo, telefono, subtotal, descuento, envio, pedido, msi)');
            tx.executeSql('SELECT * FROM sales', [], function (tx2, results) {
              var len = results.rows.length, i;
              if (len==0) {tx.executeSql('INSERT INTO sales (id) VALUES (1)');};
            }, null);            
        });
    },
    // Update DOM on a Received Event
    getProducts: function() {
        $.getJSON( "http://api.ofertaspararegalar.com/productos", function( data ) {
            $.each( data.productos, function( i, item ) {
               $("#listado-productos").append('<li><a class="add2cart" href="#two" data-precio="'+item.precio_venta_real+'" data-foto="'+item.foto+'" data-id="'+item.id+'" data-nombre="'+item.nombre+'" data-codigo="'+item.codigo+'"><img src="http://erp.ofertaspararegalar.com/media/thumbs/'+item.foto+'" /><h2>'+item.nombre+'</h2><p>'+item.codigo+'</p></a></li>').listview('refresh');
            });
            $("#cargando").hide();    
        }); 
        showCart();           
    }

};
 
 function clean(){
        var db = openDatabase('mydb', '1.0', 'Test DB', 10 * 1024 * 1024);
        db.transaction(function (tx) {
            tx.executeSql('DELETE FROM sales');
            tx.executeSql('DELETE FROM cart');
            tx.executeSql('DROP TABLE sales');
            tx.executeSql('DROP TABLE cart');
        });  
 }
function showCart(){
    var db = openDatabase('mydb', '1.0', 'Test DB', 10 * 1024 * 1024);
    db.transaction(function (tx) {
       tx.executeSql('SELECT * FROM cart', [], function (tx, results) {
          var len = results.rows.length, i;
          $("#products-in-cart").append("<thead><tr><th>Código</th><th>Descripción</th><th>Precio</th></tr></thead>");
          var total = 0;
          for (i = 0; i < len; i++){
            total = total + results.rows.item(i).price;
            $("#products-in-cart").append("<tbody><tr><td>"+results.rows.item(i).code+"</td><td>"+results.rows.item(i).description+"</td><td>"+results.rows.item(i).price+"</td></tr></tbody>");
          }          
          $("#products-in-cart").append("<tfoot><tr><td></td><td><strong>Total:</strong></td><td>"+total+"</td></tr></tfoot>");
       }, null);
    });
}
function sendProductsToOrderInCloud(order_id){
    var db = openDatabase('mydb', '1.0', 'Test DB', 10 * 1024 * 1024);
    db.transaction(function (tx) {
       tx.executeSql('SELECT * FROM cart', [], function (tx, results) {
          var len = results.rows.length, i;
          for (i = 0; i < len; i++){
            $("#products-in-cart").append("<tbody><tr><td>"+results.rows.item(i).code+"</td><td>"+results.rows.item(i).description+"</td><td>"+results.rows.item(i).price+"</td></tr></tbody>");
            var cotizacion = order_id;
            var concepto   = results.rows.item(i).description;
            var costo      = results.rows.item(i).price;
            var id_tipo    = results.rows.item(i).product_id;
            $.post( "http://erp.ofertaspararegalar.com/cotizacion/additem_from_app", { cotizacion: cotizacion, concepto: concepto, costo:costo,id_tipo:id_tipo }).done(function( data ) {
            });

          }          
       }, null);
    });
}
function showContactInformation(){
  
       var db = openDatabase('mydb', '1.0', 'Test DB', 10 * 1024 * 1024);
       db.transaction(function (tx) {
         tx.executeSql('SELECT * FROM sales WHERE id = 1', [], function (tx, results) {
          
          var cliente = results.rows.item(0).cliente; $("#cliente").val(cliente);
          var correo = results.rows.item(0).correo; $("#correo").val(correo);
          var telefono = results.rows.item(0).telefono; $("#telefono").val(telefono);
        }, null);
       });
}
function showOrderDetail(){
  
       var db = openDatabase('mydb', '1.0', 'Test DB', 10 * 1024 * 1024);
       db.transaction(function (tx) {
         tx.executeSql('SELECT * FROM sales WHERE id = 1', [], function (tx, results) {
          
          var descuento = results.rows.item(0).descuento; $("#descuento").val(descuento);
          var envio = results.rows.item(0).envio; $("#envio").val(envio);
          var pagos = results.rows.item(0).pagos; $("#pagos").val(pagos);
        }, null);
       });
}

function reviewOrder(){
      $("#products-in-cart-review").html("");
      $("#other-charges-review").html("");
       var db = openDatabase('mydb', '1.0', 'Test DB', 10 * 1024 * 1024);
       db.transaction(function (tx) {
          tx.executeSql('SELECT * FROM sales WHERE id = 1', [], function (tx, results) {
            var cliente = results.rows.item(0).cliente; $("li#cliente").html("Cliente: "+cliente);
            var correo = results.rows.item(0).correo; $("li#correo").html("Correo: "+correo);
            var telefono = results.rows.item(0).telefono; $("li#telefono").html("Teléfono: "+telefono);
          }, null);

          tx.executeSql('SELECT * FROM cart', [], function (tx, results) {
            var len = results.rows.length, i;
            $("#products-in-cart-review").append("<thead><tr><th>Código</th><th>Descripción</th><th>Precio</th></tr></thead>");
            var total = 0;
            for (i = 0; i < len; i++){
              total = total + results.rows.item(i).price;
              $("#products-in-cart-review").append("<tbody><tr><td>"+results.rows.item(i).code+"</td><td>"+results.rows.item(i).description+"</td><td>"+results.rows.item(i).price+"</td></tr></tbody>");
            }          
            $("#products-in-cart-review").append("<tfoot><tr><td></td><td>Subtotal:</td><td>"+total+"</td></tr></tfoot>");
          }, null);    

          tx.executeSql('SELECT * FROM sales WHERE id = 1', [], function (tx, results2) {
            var subtotal = results2.rows.item(0).subtotal;
            var envio = results2.rows.item(0).envio;
            var descuento = results2.rows.item(0).descuento;
            var total = 0;
            if (descuento>0) {
              var total_descuento = (descuento / 100) * subtotal;
              $("#other-charges-review").append("<tr><td></td><td>descuento %"+descuento+"</td><td>-"+total_descuento+"</td></tr>");
            }
            if (envio>0) {
              $("#other-charges-review").append("<tr><td></td><td>envio</td><td>"+envio+"</td></tr>");
              var total = subtotal + envio;
            }
            if (total_descuento>0) {
             var total = total - total_descuento; 
            }
            $("#grand-total").append("<tr><td></td><td><strong>Total</trong></td><td>"+total+"</td></tr>");
          }, null);


       });
}
$('#listado-productos').delegate('a.add2cart', 'click', function () {
     var db = openDatabase('mydb', '1.0', 'Test DB', 10 * 1024 * 1024);
     var sql ='INSERT INTO cart (product_id,code, qty,description,price) VALUES ('+$(this).data('id')+',"'+$(this).data('codigo')+'",1,"'+$(this).data('nombre')+'",'+$(this).data('precio')+')';        
     db.transaction(function (tx) {
        tx.executeSql(sql);
        showCart();
     });

     $('#listado-productos li').each(function (index) {
        $(this).addClass("ui-screen-hidden");
    });
});

$('#datos_de_contacto').delegate('#boton_datos_de_contacto', 'click', function () {
  showContactInformation();
  $.mobile.changePage('#two', { transition: "slide"} );
});

$('#detalles_de_compra').delegate('#boton_detalles_de_compra', 'click', function () {
  var cliente  = $("#cliente").val();
  var correo   = $("#correo").val();
  var telefono = $("#telefono").val();
        var db = openDatabase('mydb', '1.0', 'Test DB', 10 * 1024 * 1024);
        db.transaction(function (tx) {
            tx.executeSql('UPDATE sales SET cliente = "'+cliente+'",correo = "'+correo+'",telefono = "'+telefono+'" WHERE id = 1');
        });
        showOrderDetail();
  $.mobile.changePage('#three', { transition: "slide"} );
});
$('#grabar_compra').delegate('#boton_grabar_compra', 'click', function () {
  var metodo    = $("#metodo").val();
  var msi       = $("#msi").val();
  var tipo      = $("#tipo").val();
  var pagos     = $("#pagos").val();
  var descuento = $("#descuento").val();
  var envio     = $("#envio").val();
  var subtotal = 0;
  var db = openDatabase('mydb', '1.0', 'Test DB', 10 * 1024 * 1024);
       db.transaction(function (tx) {
       tx.executeSql('SELECT * FROM cart', [], function (message, results) {
          var len = results.rows.length, i;
          for (i = 0; i < len; i++){
            subtotal = subtotal + results.rows.item(i).price;
          }          
          if (pagos>1) {
            var fechas = [];
            for (var i = 1; i <= pagos; i++) {
              fechas.push($("#pago"+i).val());
            }
          }else{
            fechas.push($("#pago1").val());
          }
          var sql = 'UPDATE sales SET metodo = "'+metodo+'",pagos = '+pagos+',fechas = "'+fechas.toString()+'",subtotal = '+subtotal+', descuento ='+descuento+',envio='+envio+',pedido="'+tipo+'",msi='+msi+' WHERE id = 1';
          tx.executeSql(sql);
       }, null);
    });
    reviewOrder();
  $.mobile.changePage('#four', { transition: "slide"} );
});

$('#grabar_compra_in_cloud').delegate('#boton_grabar_compra_in_cloud', 'click', function () {
  var db = openDatabase('mydb', '1.0', 'Test DB', 10 * 1024 * 1024);
  db.transaction(function (tx) {
          tx.executeSql('SELECT * FROM sales WHERE id = 1', [], function (tx, results2) {
            var subtotal  = results2.rows.item(0).subtotal;
            var cliente   = results2.rows.item(0).cliente;
            var correo    = results2.rows.item(0).correo;
            var metodo    = results2.rows.item(0).metodo;
            var pagos     = results2.rows.item(0).pagos;
            var fechas    = results2.rows.item(0).fechas;
            var telefono  = results2.rows.item(0).telefono;
            var pedido    = results2.rows.item(0).pedido;
            var descuento = results2.rows.item(0).descuento;
            var envio     = results2.rows.item(0).envio;
            var msi       = results2.rows.item(0).msi;
            $.post( "http://erp.ofertaspararegalar.com/cotizacion/save_from_app", { subtotal: subtotal, cliente: cliente, correo:correo,metodo:metodo,pagos:pagos, fechas:fechas, telefono:telefono, pedido:pedido,descuento:descuento,envio:envio,msi:msi }).done(function( data ) {
              var order_id = data;
              sendProductsToOrderInCloud(order_id);
              clean();
              $.mobile.changePage('#five', { transition: "slide"} );
            });
          }, null);
  });
  
});

$("body").delegate( "#metodo", "change", function() {
  if($(this).val()=="tarjeta"){
    $("#msi_container").show();
  }else{
    $("#msi_container").hide();
  }
});

$("body").delegate( "#boton_borrar_datos", "click", function() {
        var db = openDatabase('mydb', '1.0', 'Test DB', 10 * 1024 * 1024);
        db.transaction(function (tx) {
            tx.executeSql('DELETE FROM cart');
            tx.executeSql('DELETE FROM sales');
            tx.executeSql('DROP TABLE sales');
            tx.executeSql('DROP TABLE cart');
        });
});

$("body").delegate( "#pagos", "change", function() {
  if($(this).val()>1){
    $("#pagos_container").show();
    for (var i = 1; i <= $(this).val(); i++) {
      $("#pago"+i).show();
      $("#lpago"+i).show();
    };
  }else{
    $("#pagos_container").hide().html("");
  }
});