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
            tx.executeSql('CREATE TABLE IF NOT EXISTS sales (id,cliente, metodo, pagos, correo, telefono, subtotal, descuento, envio, pedido, msi)');
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

function reviewOrder(){
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
            $("#products-in-cart-review").append("<tfoot><tr><td></td><td><strong>Subtotal:</strong></td><td>"+total+"</td></tr></tfoot>");
          }, null);    

          tx.executeSql('SELECT * FROM sales WHERE id = 1', [], function (tx, results) {
            var cliente = results.rows.item(0).cliente; $("li#cliente").html("Cliente: "+cliente);
            var correo = results.rows.item(0).correo; $("li#correo").html("Correo: "+correo);
            var telefono = results.rows.item(0).telefono; $("li#telefono").html("Teléfono: "+telefono);
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
       tx.executeSql('SELECT * FROM cart', [], function (tx, results) {
          var len = results.rows.length, i;
          for (i = 0; i < len; i++){
            subtotal = subtotal + results.rows.item(i).price;
          }          
       }, null);
       tx.executeSql('UPDATE sales SET metodo = "'+metodo+'",pagos = '+pagos+',subtotal = '+subtotal+', descuento ='+descuento+',envio='+envio+',pedido="'+pedido+'",msi='+msi+' WHERE id = 1');
    });
    reviewOrder();
  $.mobile.changePage('#four', { transition: "slide"} );
  
    /*$.post( "http://erp.ofertaspararegalar.com/cotizacion/save_from_app", { subtotal: subtotal, cliente: "2pm" }).done(function( data ) {
      alert( "Data Loaded: " + data );
    });*/
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
            tx.executeSql('DELETE FROM sales');
            tx.executeSql('DROP TABLE sales');
            tx.executeSql('DROP TABLE cart');
        });
});
$("body").delegate( "#pagos", "change", function() {
  if($(this).val()>1){
    $("#pagos_container").show();
    for (var i = 1; i <= $(this).val(); i++) {
      $("#pagos_container").append("<div class=\"hasDatepicker\"><input  class=\"hasDatepicker\" id=\"pago"+i+"\" name=\"pago"+i+"\" type=\"date\" data-inline=\"false\" placeholder=\"fecha del pago "+i+"\"></div>");
    };
  }else{
    $("#pagos_container").hide().html("");
  }
});