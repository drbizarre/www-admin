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
    },
    // Update DOM on a Received Event
    getProducts: function() {
        $.getJSON( "http://api.ofertaspararegalar.com/productos", function( data ) {
            $.each( data.productos, function( i, item ) {

               $("#listado-productos").append('<li><a class="productdetail" href="#two" data-foto="'+item.foto+'" data-id="'+item.id+'" data-nombre="'+item.nombre+'" data-codigo="'+item.codigo+'"><img src="http://erp.ofertaspararegalar.com/media/thumbs/'+item.foto+'" /><h2>'+item.nombre+'</h2><p>'+item.codigo+'</p></a></li>').listview('refresh');
            });
            $("#cargando").hide();    
        });      

    }
};

$('#contenedorNuevaFoto').delegate('#nuevaFoto', 'click', function () {
   navigator.camera.getPicture(onSuccess, onFail, { quality: 50,    destinationType: Camera.DestinationType.DATA_URL});
});



  $('#listado-productos').delegate('a.productdetail', 'click', function () {
        $("#codigo_producto").html($(this).data('codigo'));
        $("#nombre_producto").html($(this).data('nombre'));
        $("#foto_producto").attr("src","http://erp.ofertaspararegalar.com/media/"+$(this).data('foto'));
        $("#foto_producto").attr("width","100%");
     });
  function cameraSuccess(){}
  function cameraError(){}
  function cameraOptions(){}
  function onSuccess(imageData) {  var image = document.getElementById('foto_producto');  image.src = "data:image/jpeg;base64," + imageData;   $("#foto_producto").attr("width","100%");  }
  function onFail(message) {   alert('Failed because: ' + message);}