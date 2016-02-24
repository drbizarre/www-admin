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
        app.getVentas();
    },
    // Update DOM on a Received Event
    getVentas: function() {
        $.getJSON( "http://api.ofertaspararegalar.com/ventas", function( data ) {
            $.each( data.ventas, function( i, item ) {
               $("#listado-ventas").append('<li><a href="#" class="newPayment" data-cliente="'+item.cliente+'" data-total="'+item.total+'" data-fecha="'+item.fecha+'" data-id="'+item.id+'"><h2>'+item.cliente+'</h2><p>'+item.fecha+' - $'+item.total+'</p></a></li>').listview('refresh');
            });
            $("#cargando").hide();    
        });          
    }
};
$('body').delegate('a.newPayment', 'click', function () {
     $("#detalles-compra").show();
     $("#id_compra").val($(this).data('id'));
     $("#cliente").html("Cliente:"+$(this).data('cliente'));
     $("#total").html("Total: $"+$(this).data('total'));
     $("#fechat").html("Fecha:"+$(this).data('fecha'));
     $('#listado-ventas li').each(function (index) {
        $(this).addClass("ui-screen-hidden");
    });
});
$('#grabar_pago').delegate('#boton_grabar_pago', 'click', function () {
    var id_compra = $("#id_compra").val();
    var fecha = $("#fecha").val();
    var monto = $("#monto").val();
    $.post( "http://erp.ofertaspararegalar.com/cotizacion/nuevo_pago_app", { id_compra: id_compra, fecha: fecha, monto:monto }).done(function( data ) {
        alert("Pago grabado");        
        $("#fecha").val("");
        $("#monto").val("");
    });
});