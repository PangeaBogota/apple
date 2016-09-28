/**
 * Created by dev10 on 12/23/2015.
 */
var app_angular = angular.module('PedidosOnline', ['chart.js','ui.calendar','angular-websql', 'ngResource', 'ngRoute','angular-bootbox']);

app_angular.config(['$routeProvider',//'$locationProvider',
    function ($routeProvider) {
        //, $locationProvider) {
        $routeProvider
            .when("/", {
                controller: 'appController',
                templateUrl: "view/home/home.html"
            })
            .when('/:modulo/:url', {
                template: '<div ng-include="templateUrl">Loading...</div>',
                controller: 'appController'
            })
            .when('/:modulo/:url/:personId', {
                template: '<div ng-include="templateUrl">Loading...</div>',
                controller: 'appController'
            })
            /*.when("/:modulo/:url",{
             controller:'appController',
             templateUrl: function(urlattr){
             if(urlattr.modulo=='pagina_Actual')
             return '#'+ urlattr.url;
             if(urlattr.modulo=='' || urlattr.url=='') {
             urlattr.modulo = 'home';
             urlattr.urlurl = 'home';
             }
             //angular.element('#titulo').html( urlattr.urlurl);
             return 'view/'+ urlattr.modulo+'/' + urlattr.url + '.html';
             }
             })*/
            .otherwise("/");
        // use the HTML5 History API
        //$locationProvider.html5Mode(true);
    }
]);

//CONTROLADOR DE GENERAL
app_angular.controller('sessionController',['bootbox','Conexion','$scope','$location','$http','$route', '$routeParams', 'Factory' ,function (bootbox,Conexion, $scope, $location, $http,$route, $routeParams, Factory) {
    $scope.sessiondate=JSON.parse(window.localStorage.getItem("CUR_USER"));
    $scope.pedidos=[];
    $scope.actividades=[];
    $scope.status=[];
    $scope.alerta=[];
    $scope.errorAlerta=[];
    $scope.errorAlerta.banderaPedido=0;
    $scope.errorAlerta.bandera=0;
    $scope.detalle_pedidos_detalle=[];
    $scope.$watch('online', function(newStatus) 
        //$scope.status.connextionstate==false
        {$scope.status.connextionstate=newStatus;  
            if ($scope.status.connextionstate==false) {
            $scope.alerta.message='Verifique su conexion a Internet ';
            $scope.alerta.disableBtnAceptar=false;
            $scope.alerta.header='Conexion Internet'
        }
        else
        {
            $scope.alerta.header='Confirmar Sincronizacion'
            $scope.alerta.disableBtnAceptar=true;
            $scope.alerta.message='Esta seguro de realizar la Sincronizacion asumiendo el posible  consumo de datos elevado?';
        }
        });
    $scope.confirmarSincronizacion=function(){
        $('#openConfirmacion').click();
        
    }

    $scope.envioInformacion=function(){
        debugger
        $scope.usuario=$scope.sessiondate.nombre_usuario;
        $scope.codigoempresa=$scope.sessiondate.codigo_empresa;
        $scope.informacion=[];
        CRUD.selectAllinOne("select*from t_pedidos_detalle_detalle where estado=0",function(subitem){
            
            if (subitem.length>0) {
                $scope.informacion.subitem=subitem;
                CRUD.selectAllinOne("select*from t_pedidos_detalle where estado=0",function(item){
            
                    if (item.length>0) {
                        $scope.informacion.item=item;
                        CRUD.selectAllinOne("select*from t_pedidos where estado_sincronizacion=0",function(pedido){
            
                            if (pedido.length>0) {
                                $scope.informacion.pedido=pedido;
                                var pedidosJSON=JSON.stringify($scope.informacion.pedido);
                                var itemJSON=JSON.stringify($scope.informacion.item);
                                var subItemJSON=JSON.stringify($scope.informacion.subitem);
                                debugger
                                $http({
                                  method: 'post',
                                  url: 'http://localhost:45091/Mobile/SyncInfoMobile',
                                  data:{usuario:$scope.usuario,entidad:'DATA',codigo_empresa:$scope.codigo_empresa,subitem:subItemJSON,item:itemJSON,pedidos:pedidosJSON} 
                                    }).then(
                                    function success(data) {
                                        
                                    }, 
                                    function error(err) {
                                        if ($scope.errorAlerta.bandera!=0) {
                                            Mensajes('Sincronizacion Incompleta','error','');    
                                        }
                                        $scope.errorAlerta.bandera=1;return 
                                });    
                            }
                            
                        })
                    }
                })
            }
        })
    }
    //$scope.envioInformacion();





    $scope.envioSubItem=function(){
        $scope.usuario=$scope.sessiondate.nombre_usuario;
        $scope.codigoempresa=$scope.sessiondate.codigo_empresa;
        CRUD.selectAllinOne("select*from t_pedidos_detalle_detalle where estado=0",function(elem){
            for (var i =0;i<elem.length;i++) {
                var rowid=elem[i].rowid
                if ($scope.status.connextionstate==false) {
                    $scope.errorAlerta.bandera=1;
                    break;
                }

                $http({
                  method: 'GET',
                  url: 'http://demos.pedidosonline.co/Mobile/syncV2?usuario='+$scope.usuario+'&entidad=SUBITEM&codigo_empresa=' + $scope.codigoempresa + '&datos=' + JSON.stringify(elem[i]),
                  timeout:2000
                    }).then(
                    function success(data) {
                        CRUD.Updatedynamic("update t_pedidos_detalle_detalle set estado=1 where rowid="+data.data.rowid+"");
                    }, 
                    function error(err) {
                        if ($scope.errorAlerta.bandera!=0) {
                            Mensajes('Sincronizacion Incompleta','error','');    
                        }
                        $scope.errorAlerta.bandera=1;return 
                });
            }
        })
    }
    $scope.envioItem=function(){
        $scope.usuario=$scope.sessiondate.nombre_usuario;
        $scope.codigoempresa=$scope.sessiondate.codigo_empresa;
        
        CRUD.selectAllinOne("select*from t_pedidos_detalle where estado=0",function(elem){
            for (var i =0;i<elem.length;i++) {
                var rowid=elem[i].rowid
                if ($scope.status.connextionstate==false) {
                    $scope.errorAlerta.bandera=1;
                    break;
                }
                $http({
                  method: 'GET',
                  url: 'http://demos.pedidosonline.co/Mobile/syncV2?usuario='+$scope.usuario+'&entidad=ITEM&codigo_empresa=' + $scope.codigoempresa + '&datos=' + JSON.stringify(elem[i]),
                  timeout:2000
                    }).then(
                    function success(data) { 
                        CRUD.Updatedynamic("update t_pedidos_detalle set estado=1 where rowid="+data.data.rowid+"");
                    }, 
                    function error(err) {
                        if ($scope.errorAlerta.bandera!=1) {
                            Mensajes('Sincronizacion Incompleta','error','');
                        }
                        $scope.errorAlerta.bandera=1;return 
                });
            }
        })
    }

    $scope.envioPedido=function(){
        $scope.usuario=$scope.sessiondate.nombre_usuario;
        $scope.codigoempresa=$scope.sessiondate.codigo_empresa;
        CRUD.selectAllinOne("select*from t_pedidos where estado_sincronizacion=0",function(elem){
            for (var i =0;i<elem.length;i++) {
                if ($scope.status.connextionstate==false) {
                    $scope.errorAlerta.bandera=1;
                    break;
                }
                var rowid=elem[i].rowid
                $http({
                  method: 'GET',
                  url: 'http://demos.pedidosonline.co/Mobile/syncV2?usuario='+$scope.usuario+'&entidad=PEDIDO&codigo_empresa=' + $scope.codigoempresa + '&datos=' + JSON.stringify(elem[i])
                    }).then(
                    function success(data) { 
                        CRUD.Updatedynamic("update t_pedidos set estado_sincronizacion=1,sincronizado='true' where rowid="+data.data.rowid+"");
                    }, 
                    function error(err) {Mensajes('Sincronizacion Incompleta','error','');$scope.errorAlerta.bandera=1;return 
                });
            }
        })
    }

    $scope.datosSubir=function(){
        $scope.pedidos=[];
        $scope.actividades=[];
        $scope.detalle_pedidos=[];
        $scope.detalle_pedidos_detalle=[];
        $scope.pedido=[];
        $scope.errorAlerta.bandera=0;
        window.setTimeout(function(){
            
            $scope.envioSubItem();
            $scope.envioItem();
            window.setTimeout(function(){
                if ($scope.errorAlerta.bandera!=1) {
                      $scope.envioPedido();             
                }
            },7000)    

            
        },1000)
    }
    $scope.Request=function(url){
        $scope.errorAlerta.bandera=0;
        $http({
          method: 'GET',
          url: url,
          timeout : 3000,
        })
        .then(
            function success(data) {
                CRUD.Updatedynamic("update t_pedidos set key_mobile='"+data.data.rowid+"'  where rowid='"+data.data.rowidInicial+"'")
                
                $scope.pedidorowid=data.data.rowid
                angular.forEach($scope.detalle_pedidos,function(event){
                    if (event.rowid_pedido==data.data.rowidInicial) {
                        $scope.detalle=event;
                        $scope.detalle.rowid_pedido=$scope.pedidorowid;
                        $http({
                          method: 'GET',
                          url: 'http://demos.pedidosonline.co/Mobile/reymon?usuario='+$scope.usuario+'&entidad=PEDIDO_DETALLE_REYMON&codigo_empresa=' + $scope.codigoempresa + '&datos=' + JSON.stringify($scope.detalle),
                          timeout : 3000,
                        })
                        .then(
                            function success(data1) {
                                angular.forEach($scope.detalle_pedidos_detalle,function(extension){
                                    if (extension.pedidoDetalle.toString().includes(data1.data.rowid_inicial)) {

                                        $scope.detalledetalle=extension
                                        $scope.detalledetalle.pedidoDetalle=data1.data.rowiddetalle
                                        $http({
                                          method: 'GET',
                                          url: 'http://demos.pedidosonline.co/Mobile/reymon?usuario='+$scope.usuario+'&entidad=T_PEDIDOS_DETALLE_DETALLE&codigo_empresa=' + $scope.codigoempresa + '&datos=' + JSON.stringify($scope.detalledetalle),
                                          timeout : 3000,
                                        })
                                        .then(
                                            function success(data2) { debugger
                                            }, 
                                            function error(err) {debugger;Mensajes('Error Enviando Ext2','error','');$scope.errorAlerta.bandera=1;return }
                                        ); 
                                    }
                                })
                            }, 
                            function error(err) {Mensajes('Error al Subir items del Pedido','error','');$scope.errorAlerta.bandera=1;return }
                        ); 
                    }
                });
                if ($scope.errorAlerta.bandera==0) {
                    CRUD.Updatedynamic("update t_pedidos set estado_sincronizacion=1  ,sincronizado='true' where rowid='"+data.data.rowidInicial+"'")
                }
                Mensajes('Pedido Registrado ' +data.data.rowidInicial ,'success','')
            }, 
            function error(err) {}
        ); 
    }
    

    $scope.envioPlano=function(){
        $scope.usuario=$scope.sessiondate.nombre_usuario;
        $scope.codigoempresa=$scope.sessiondate.codigo_empresa;
        
        CRUD.selectAllinOne("select*from s_planos_pedidos where estado=0 order by ultimo_registro asc",function(elem){
            debugger
            if (elem.length<100) {
                OFFSET=15000
            }
            else if (elem.length<300) {
                OFFSET=30000
            }
            else if (elem.length>300) {
                OFFSET=60000
            }

            for (var i =0;i<elem.length;i++) {
                var rowid=elem[i].rowid
                if ($scope.status.connextionstate==false) {
                    $scope.errorAlerta.bandera=1;
                    break;
                }
                $http({
                  method: 'GET',
                  url: 'http://demos.pedidosonline.co/Mobile/sync?usuario='+$scope.usuario+'&entidad=PLANO&codigo_empresa=' + $scope.codigoempresa + '&datos=' + JSON.stringify(elem[i]),
                  timeout:OFFSET
                    }).then(
                    function success(data) { 
                        CRUD.Updatedynamic("update s_planos_pedidos set estado=1 where rowid="+data.data.rowid+"");
                    }, 
                    function error(err) {
                        $scope.errorAlerta.bandera=1;return 
                });
            }
        })
    }
    $scope.build=function(){
        $scope.queryBuild='    select  '+
           ' t.key_user,'+
           ' t.rowid_empresa,'+
            't.id_cia,t.usuariocreacion,'+
            't.fechacreacion,'+
            't.rowid as e_rowid, '+
            't.rowid_cliente_facturacion as  e_rowid_cliente_facturacion,'+
            't.rowid_cliente_despacho as e_rowid_cliente_despacho,'+
            't.rowid_lista_precios as e_rowid_lista_precios,'+
            't.id_punto_envio as e_id_punto_envio,'+
            't.fecha_pedido as e_fecha_pedido,'+
            't.fecha_entrega as e_fecha_entrega,'+
            't.valor_base as e_valor_base,'+
            't.valor_descuento as e_valor_descuento,'+
            't.valor_impuesto as e_valor_impuesto,'+
            't.valor_total as e_valor_total,'+
            't.id_estado as e_id_estado,'+
            't.ind_estado_erp as e_ind_estado_erp,'+
            't.valor_facturado as e_valor_facturado,'+
            't.fecha_solicitud as e_fechasolicitud,'+
            't.orden_compra as e_orden_compra,'+
            't.modulo_creacion as e_modulo_creacion,'+
            't.observaciones as e_observaciones,'+
            'tpd.rowid as d_rowid,'+
            'tpd.rowid_pedido as d_rowid_pedido,'+
            'tpd.rowid_item as d_rowid_item,'+
            'tpd.linea_descripcion as d_linea_descripcion,'+
            'tpd.id_unidad as d_id_unidad,'+
            'tpd.cantidad as d_cantidad,'+
            'tpd.factor as d_factor,'+
            'tpd.cantidad_base as d_cantidad_base,'+
           'tpd.stock as d_stock,'+
            'tpd.porcen_descuento as d_porcen_descuento,'+
            'tpd.valor_base as d_valor_base,'+
            'tpd.valor_impuesto as d_valor_impuesto,'+
            'tpd.valor_total_linea as d_valor_total_linea,'+
            'tpd.item_ext1 as d_item_ext1,'+
            'tpd.rowid_item_ext as d_rowid_item_ext,'+
            'tpd.empaque as d_empaque,'+
            'tpd.observaciones as d_observaciones,'+
            'tpd.rowid_bodega as d_rowid_bodega,'+
            'tpd.precio_unitario as d_precio_unitario,'+
            'tpd.valor_descuento as d_valor_descuento,'+
            'tpdd.rowid as s_rowid,'+
            'tpdd.pedidodetalle as s_rowid_detalle,'+
            'tpdd.cantidad as s_cantidad,'+
            'tpdd.itemExtension2Detalle as s_itemextencion2detalle '+
            ' from t_pedidos t'+
            ' inner  join  t_pedidos_detalle tpd '+
            ' on tpd.rowid_pedido=t.rowid'+
            ' inner  join t_pedidos_detalle_detalle tpdd '+
            ' on tpdd.pedidodetalle=tpd.rowid   where  t.rowid= __REQUIRED  and estado_sincronizacion=0 '+
            ' order by t.rowid asc';
        CRUD.select("select*from t_pedidos where estado_sincronizacion=0 ",function(elem){
            $scope.queryBuild=$scope.queryBuild.replace('__REQUIRED',elem.rowid)
            CRUD.selectAllinOne($scope.queryBuild,function(ped){
                var rowidPedido=0;
                var contador=0;
                var  stringSentencia='';
                var NewQuery=true;
                var ultimoregistro=ped.length-1;
                var step=0;
                for (var i =0;i<ped.length;i++) {
                    if (ultimoregistro==i) {
                        step=1
                    }
                    rowidPedido=ped[i].e_rowid
                    if (NewQuery) {
                        stringSentencia=" insert into s_planos_pedidos  ";
                        NewQuery=false;
                    }
                    else{
                        stringSentencia+= "   UNION   ";
                    }
                    stringSentencia+=  "  SELECT  "+
                    //ped[i].e_rowid+

                    "null,'"+ped[i].key_user+
                    "','"+ped[i].rowid_empresa+
                    "','"+ped[i].id_cia+
                    "','"+ped[i].key_user+
                    "','"+ped[i].usuariocreacion+
                    "','"+ped[i].fechacreacion+
                    "','"+ped[i].e_rowid+
                    "','"+ped[i].e_rowid_cliente_facturacion+
                    "','"+ped[i].e_rowid_cliente_despacho+
                    "','"+ped[i].e_rowid_lista_precios+
                    "','"+ped[i].e_id_punto_envio+
                    "','"+ped[i].e_fecha_pedido+
                    "','"+ped[i].e_fecha_entrega+
                    "','"+ped[i].e_valor_base+
                    "','"+ped[i].e_valor_descuento+
                    "','"+ped[i].e_valor_impuesto+
                    "','"+ped[i].e_valor_total+
                    "','"+ped[i].e_id_estado+
                    "','"+ped[i].e_ind_estado_erp+
                    "','"+ped[i].e_valor_facturado+
                    "','"+ped[i].e_fechasolicitud+
                    "','"+ped[i].e_orden_compra+
                    "','"+ped[i].e_modulo_creacion+
                    "','"+ped[i].e_observaciones+
                    "','"+ped[i].d_rowid+
                    "','"+ped[i].d_rowid_pedido+
                    "','"+ped[i].d_rowid_item+
                    "','"+ped[i].d_linea_descripcion+
                    "','"+ped[i].d_id_unidad+
                    "','"+ped[i].d_cantidad+
                    "','"+ped[i].d_factor+
                    "','"+ped[i].d_cantidad_base+
                    "','"+ped[i].d_stock+
                    "','"+ped[i].d_porcen_descuento+
                    "','"+ped[i].d_valor_base+
                    "','"+ped[i].d_valor_impuesto+
                    "','"+ped[i].d_valor_total_linea+
                    "','"+ped[i].d_item_ext1+
                    "','"+ped[i].d_rowid_item_ext+
                    "','"+ped[i].d_empaque+
                    "','"+ped[i].d_observaciones+
                    "','"+ped[i].d_rowid_bodega+
                    "','"+ped[i].s_rowid+
                    "','"+ped[i].s_rowid_detalle+
                    "','"+ped[i].s_cantidad+
                    "','"+ped[i].s_itemextencion2detalle+
                    "',0,"+step+",0,0,'"+ped[i].d_precio_unitario+"','"+ped[i].d_valor_descuento+"','"+ped.length+"' "; 
                    if (contador==499) {
                        CRUD.Updatedynamic(stringSentencia)
                        NewQuery=true;
                        stringSentencia="";
                        contador=0;
                    }
                }
                if (stringSentencia!='') {
                    CRUD.Updatedynamic(stringSentencia)
                    NewQuery=true;
                }
                CRUD.Updatedynamic("update t_pedidos set estado_sincronizacion=1,sincronizado='plano' where rowid="+rowidPedido+"");
            })
        }) 
    }
    //CRUD.Updatedynamic("update t_pedidos set estado_sincronizacion=0,sincronizado='false' where rowid=10063");
    //$scope.build();
    $scope.sincronizar=function(){
        $scope.errorAlerta.bandera=0;
        ProcesadoShow();   
        $scope.envioPlano();    
        window.setTimeout(function(){
            window.setTimeout(function(){
                if ($scope.errorAlerta.bandera==1) {
                    Mensajes('Error al Sincronizar, Por favor revise que su conexion sea estable','warning','');
                    ProcesadoHiden();
                    $route.reload();
                    return
                }
                else
                {
                    
                    CRUD.Updatedynamic("update t_pedidos set sincronizado='true' where sincronizado='plano'");
                }
                CRUD.Updatedynamic("delete from crm_actividades");
                CRUD.Updatedynamic("delete from erp_items");
                CRUD.Updatedynamic("delete from erp_entidades_master");
                CRUD.Updatedynamic("delete from erp_items_precios");
                CRUD.Updatedynamic("delete  from erp_terceros");
                CRUD.Updatedynamic("delete from erp_terceros_punto_envio");
                CRUD.Updatedynamic("delete from erp_terceros_sucursales");
                CRUD.Updatedynamic("delete from m_estados");
                CRUD.Updatedynamic("delete from m_metaclass");
                CRUD.Updatedynamic("delete from crm_contactos");
                CRUD.Updatedynamic("delete from s_usuarios");
                CRUD.Updatedynamic("delete from erp_item_extension1");
                CRUD.Updatedynamic("delete from erp_item_extension2");
                CRUD.Updatedynamic("delete from erp_item_extencion1_detalle");
                CRUD.Updatedynamic("delete from erp_item_extencion2_detalle");
                CRUD.Updatedynamic("delete from erp_items_extenciones");
                CRUD.Updatedynamic("delete from t_pedidos_detalle_web");
                CRUD.Updatedynamic("delete from t_pedidos_web");
                
                //
                Sincronizar($scope.sessiondate.nombre_usuario,$scope.sessiondate.codigo_empresa);
                if (CONSTATE_SYNCT==1) {
                    Mensajes("Error Conexion! Verificar Conexion.Sincronizar nuevamente","warning","");
                    CONSTATE_SYNCT=0;
                    ProcesadoHiden();
                    return
                }
                else
                {
                    Mensajes('Informacion Procesada','success','');
                }
                //Guardar Nuevos Datos
                    var contador=0;
                    var stringSentencia='';
                    var NewQuery=true;
                   for(var i=0; i < STEP_SINCRONIZACION.length; i++)
                    {
                        var contador1=0;
                        contador=0;
                        NewQuery=true;
                        stringSentencia='';
                        for(var j=0; j < DATOS_ENTIDADES_SINCRONIZACION[i].length; j++) {
                            contador1++;
                            contador++;
                            if (STEP_SINCRONIZACION[i] == ENTIDAD_PEDIDOS  && DATOS_ENTIDADES_SINCRONIZACION[i].length!=0  ) {
                                //CRUD.insert('t_pedidos',DATOS_ENTIDADES_SINCRONIZACION[i][j]);
                                //

                                if (NewQuery) {
                                    stringSentencia=" insert into t_pedidos_web  ";
                                    NewQuery=false;
                                }
                                else{
                                    stringSentencia+= "   UNION   ";
                                }
                                stringSentencia+=  "  SELECT  '"+
                                DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_empresa+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_cia+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_cliente_facturacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_cliente_despacho+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_lista_precios+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_bodega+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fecha_pedido+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fecha_entrega+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fecha_solicitud+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_punto_envio+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].observaciones+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].observaciones2+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].orden_compra+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].referencia+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].valor_base+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].valor_descuento+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].valor_impuesto+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].valor_total+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_estado+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].numpedido_erp+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].numfactura_erp+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].estado_erp+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].valor_facturado+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_cond_especial+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechacreacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariocreacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechamod+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariomod+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].tipo_doc+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_vendedor+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_cond_pago+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].numremision_erp+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_co+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].transporte_conductor_cc+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].transporte_conductor_nombre+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].transporte_placa+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fecha_anulacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuario_anulacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_nota+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].criterio_clasificacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].ind_estado_erp+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].modulo_creacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].sincronizado+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].key_mobile+
                                "','1','00000000001' "; 
                                if (contador==499) {
                                    CRUD.Updatedynamic(stringSentencia)
                                    NewQuery=true;
                                    stringSentencia="";
                                    contador=0;
                                }
                            }
                            else if (STEP_SINCRONIZACION[i] == ENTIDAD_PEDIDOS_DETALLE  && DATOS_ENTIDADES_SINCRONIZACION[i].length!=0 ) {
                                //CRUD.insert('t_pedidos_detalle',DATOS_ENTIDADES_SINCRONIZACION[i][j]);
                                //debugger
                                if (NewQuery) {
                                    stringSentencia=" insert into t_pedidos_detalle_web  ";
                                    NewQuery=false;
                                }
                                else{
                                    stringSentencia+= "   UNION   ";
                                }
                                stringSentencia+=  "  SELECT  '"+
                                DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_pedido+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_bodega+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_item+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].linea_descripcion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_unidad+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].cantidad+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].factor+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].cantidad_base+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].precio_unitario+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_motivo+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].stock+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].valor_base+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].valor_impuesto+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].porcen_descuento+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].valor_porcen_descuento+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].valor_descuento+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].valor_total_linea+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].unidad_medida+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechacreacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariocreacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechamod+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariomod+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_item_ext+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].item_ext1+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].item_ext2+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].num_lote+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fecha_anulacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuario_anulacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].flete+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].porcen_descuento2+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].valor_porcen_descuento2+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].porcen_descuento3+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].valor_porcen_descuento3+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].observaciones+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].empaque+"',1,1 "; 
                                if (contador==499) {
                                    CRUD.Updatedynamic(stringSentencia)
                                    NewQuery=true;
                                    stringSentencia="";
                                    contador=0;
                                }
                            }
                            else if (STEP_SINCRONIZACION[i] == ENTIDAD_TERCEROS  && DATOS_ENTIDADES_SINCRONIZACION[i].length!=0) {
                                //CRUD.insert('erp_terceros',DATOS_ENTIDADES_SINCRONIZACION[i][j]);
                                if (NewQuery) {
                                    stringSentencia=" insert into erp_terceros  ";
                                    NewQuery=false;
                                }
                                else{
                                    stringSentencia+= "   UNION   ";
                                }
                                stringSentencia+=  "  SELECT  '"+
                                DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_empresa+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_cia+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_interno+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].identificacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].tipo_identificacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].razonsocial+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].nombre_comercial+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].codigo_erp+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].ind_activo+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].es_vendedor+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].es_cliente+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].es_proveedor+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].es_accionista+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].industria+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].tipo_industria+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].clasificacion+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechacreacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariocreacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechamod+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariomod+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_impuesto+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].descripcion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].contacto+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].direccion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].email+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].telefono+"' "; 
                                if (contador==499) {
                                    CRUD.Updatedynamic(stringSentencia)
                                    NewQuery=true;
                                    stringSentencia="";
                                    contador=0;
                                }

                            }
                            else if (STEP_SINCRONIZACION[i] == ENTIDAD_SUCURSALES && DATOS_ENTIDADES_SINCRONIZACION[i].length!=0) {
                                //CRUD.insert('erp_terceros_sucursales',DATOS_ENTIDADES_SINCRONIZACION[i][j]);
                                if (DATOS_ENTIDADES_SINCRONIZACION[i][j].length==0) {

                                }
                                if (NewQuery) {
                                    stringSentencia=" insert into erp_terceros_sucursales  ";
                                    NewQuery=false;
                                }
                                else{
                                    stringSentencia+= "   UNION   ";
                                }
                                stringSentencia+=  "  SELECT  '"+
                                DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_empresa+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_tercero+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].tipo_sucursal+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].nombre_sucursal+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].codigo_sucursal+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].direccion1+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].direccion2+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].direccion3+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].telefono1+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].telefono2+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].codigo_postal+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_ciudad+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_depto+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_pais+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_lista_precios+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].nombre_contacto+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].email_contacto+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].centro_operacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_condicion_pago+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_vendedor+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_unidad_negocio+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_grupo_descuento+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_zona+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].porcen_descuento+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].ind_bloqueo_cupo+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].ind_bloqueo_mora+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].cupo_credito+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_tipo_cliente+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechacreacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariocreacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechamod+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariomod+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].ind_estado+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuario+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].clave+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_bodega+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_division+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_canal+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].ind_principal+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_criterio_clasificacion+"' "; 
                                if (contador==499) {
                                    
                                    CRUD.Updatedynamic(stringSentencia)
                                    NewQuery=true;
                                    stringSentencia="";
                                    contador=0;
                                }
                            }
                            else if (STEP_SINCRONIZACION[i] == ENTIDAD_MAESTROS  && DATOS_ENTIDADES_SINCRONIZACION[i].length!=0) {
                                //CRUD.insert('erp_entidades_master',DATOS_ENTIDADES_SINCRONIZACION[i][j]);
                                if (NewQuery) {
                                    stringSentencia=" insert into erp_entidades_master  ";
                                    NewQuery=false;
                                }
                                else{
                                    stringSentencia+= "   UNION   ";
                                }
                                stringSentencia+=  "  SELECT  '"+
                                DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_tipo_maestro+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_empresa+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].erp_id_cia+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].erp_rowid_maestro+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].erp_id_maestro+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].erp_descripcion+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].custom1+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].email+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechacreacion+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariocreacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechamod+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariomod+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].ind_disabled+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].custom2+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].custom3+"' "; 
                                if (contador==499) {
                                    CRUD.Updatedynamic(stringSentencia)
                                    NewQuery=true;
                                    stringSentencia="";
                                    contador=0;
                                }
                            }
                            else if (STEP_SINCRONIZACION[i] == ENTIDAD_PUNTOS_ENVIO  && DATOS_ENTIDADES_SINCRONIZACION[i].length!=0) {
                                //CRUD.insert('erp_terceros_punto_envio',DATOS_ENTIDADES_SINCRONIZACION[i][j]);
                                if (NewQuery) {
                                    stringSentencia=" insert into erp_terceros_punto_envio  ";
                                    NewQuery=false;
                                }
                                else{
                                    stringSentencia+= "   UNION   ";
                                }
                                stringSentencia+=  "  SELECT  '"+
                                DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_empresa+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_tercero+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].codigo_sucursal+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_punto_envio+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].nombre_punto_envio+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_vendedor+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].ind_estado+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechacreacion+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariocreacion+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechamod+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariomod+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].direccion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].contacto+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].email+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].telefono+"' "; 
                                if (contador==499) {
                                    CRUD.Updatedynamic(stringSentencia)
                                    NewQuery=true;
                                    stringSentencia="";
                                    contador=0;
                                }
                            }
                            else if (STEP_SINCRONIZACION[i] == ENTIDAD_ITEMS  && DATOS_ENTIDADES_SINCRONIZACION[i].length!=0) {
                                //CRUD.insert('erp_items',DATOS_ENTIDADES_SINCRONIZACION[i][j]);
                                if (NewQuery) {
                                    stringSentencia=" insert into erp_items  ";
                                    NewQuery=false;
                                }
                                else{
                                    stringSentencia+= "   UNION   ";
                                }
                                stringSentencia+=  "  SELECT  '"+
                                DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_empresa+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_cia+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_item_erp+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_item_ext+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_item+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].item_referencia+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].item_codigo+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].item_descripcion+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].item_linea+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].item_ext1+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].item_ext2+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_unidad+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_unidad_venta+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].ind_estado+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].descripcion_extensa+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechacreacion+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariocreacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechamod+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariomod+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].item_custom1+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].impuesto_id+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].impuesto_porcentaje+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].descripcion_adicional+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].cantidad_embalaje+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].tipo_inventario+"' "; 
                                
                                if (contador==499) {
                                    CRUD.Updatedynamic(stringSentencia)
                                    NewQuery=true;
                                    stringSentencia="";
                                    contador=0;
                                }
                            }
                            else if (STEP_SINCRONIZACION[i] == ENTIDAD_ITEMS_PRECIOS  && DATOS_ENTIDADES_SINCRONIZACION[i].length!=0) {
                                //CRUD.insert('erp_items_precios',DATOS_ENTIDADES_SINCRONIZACION[i][j]);
                                if (NewQuery) {
                                    stringSentencia=" insert into erp_items_precios  ";
                                    NewQuery=false;
                                }
                                else{
                                    stringSentencia+= "   UNION   ";
                                }
                                stringSentencia+=  "  SELECT  '"+
                                DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_empresa+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_cia+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_lista_precios+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_item+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_item_ext+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_unidad+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].precio_lista+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechacreacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariocreacion+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechamod+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariomod+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fecha_activacion+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fecha_inactivacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].estado_item+"' "; 
                                if (contador==499) {
                                    CRUD.Updatedynamic(stringSentencia)
                                    NewQuery=true;
                                    stringSentencia="";
                                    contador=0;
                                }
                            }
                            else if (STEP_SINCRONIZACION[i] == ENTIDAD_ACTIVIDADES  && DATOS_ENTIDADES_SINCRONIZACION[i].length!=0) {
                                //CRUD.insert('crm_actividades',DATOS_ENTIDADES_SINCRONIZACION[i][j]);
                                //debugger
                                if (NewQuery) {
                                    stringSentencia=" insert into crm_actividades  ";
                                    NewQuery=false;
                                }
                                else{
                                    stringSentencia+= "   UNION   ";
                                }
                                stringSentencia+=  "  SELECT  '"+
                                DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].tipo+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].tema+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].ind_prioridad+
                                 "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].descripcion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].tipo_relacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_estado+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].relacionado_a+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fecha_inicial+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fecha_final+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuario_creacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fecha_creacion+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuario_modificacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fecha_modificacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_relacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].sincronizado+"' "; 
                                if (contador==499) {
                                    CRUD.Updatedynamic(stringSentencia)
                                    NewQuery=true;
                                    stringSentencia="";
                                    contador=0;
                                }
                            }
                            else if (STEP_SINCRONIZACION[i] == ENTIDAD_METACLASS  && DATOS_ENTIDADES_SINCRONIZACION[i].length!=0) {
                                //CRUD.insert('m_metaclass',DATOS_ENTIDADES_SINCRONIZACION[i][j]);
                                if (NewQuery) {
                                    stringSentencia=" insert into m_metaclass  ";
                                    NewQuery=false;
                                }
                                else{
                                    stringSentencia+= "   UNION   ";
                                }
                                stringSentencia+=  "  SELECT  '"+
                                DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].class_code+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].tipo_reg_codigo+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].tipo_reg_nombre+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].ind_activo+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].CreatedBy+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].CreationDate+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].ModifiedBy+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].ModDate+"' "; 
                                if (contador==499) {
                                    CRUD.Updatedynamic(stringSentencia)
                                    NewQuery=true;
                                    stringSentencia="";
                                    contador=0;
                                }
                            }
                            else if (STEP_SINCRONIZACION[i] == ENTIDAD_ESTADOS  && DATOS_ENTIDADES_SINCRONIZACION[i].length!=0) {
                                //CRUD.insert('m_estados',DATOS_ENTIDADES_SINCRONIZACION[i][j]);
                                if (NewQuery) {
                                    stringSentencia=" insert into m_estados  ";
                                    NewQuery=false;
                                }
                                else{
                                    stringSentencia+= "   UNION   ";
                                }
                                stringSentencia+=  "  SELECT  '"+
                                DATOS_ENTIDADES_SINCRONIZACION[i][j].id_estado+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].tipo_estado+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].nombre_estado+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].ind_editar+"' "; 
                                if (contador==499) {
                                    CRUD.Updatedynamic(stringSentencia)
                                    NewQuery=true;
                                    stringSentencia="";
                                    contador=0;
                                }
                            }
                            else if (STEP_SINCRONIZACION[i] == ENTIDAD_CONTACTOS  && DATOS_ENTIDADES_SINCRONIZACION[i].length!=0) {
                                //CRUD.insert('crm_contactos',DATOS_ENTIDADES_SINCRONIZACION[i][j]);
                                if (NewQuery) {
                                    stringSentencia=" insert into crm_contactos  ";
                                    NewQuery=false;
                                }
                                else{
                                    stringSentencia+= "   UNION   ";
                                }
                                stringSentencia+=  "  SELECT  '"+
                                DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_sucursal+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].identificacion+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].nombres+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].apellidos+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].email+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].telefono+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].skype+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].descripcion+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].ruta_imagen+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].celular+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].cargo+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].area+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].ind_principal+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuario_creacion+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fecha_creacion+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuario_modificacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fecha_modificacion+"' "; 
                                if (contador==499) {
                                    CRUD.Updatedynamic(stringSentencia)
                                    NewQuery=true;
                                    stringSentencia="";
                                    contador=0;
                                }

                            } 
                            else if (STEP_SINCRONIZACION[i] == ENTIDAD_LOCALIZACION  && DATOS_ENTIDADES_SINCRONIZACION[i].length!=0) {
                                //CRUD.insert('crm_contactos',DATOS_ENTIDADES_SINCRONIZACION[i][j]);
                                if (NewQuery) {
                                    stringSentencia=" insert into m_localizacion  ";
                                    NewQuery=false;
                                }
                                else{
                                    stringSentencia+= "   UNION   ";
                                }
                                stringSentencia+=  "  SELECT  '"+
                                DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_tipo_erp+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].tipo_localizacion+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_pais+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_depto+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_ciudad+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].nombre+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].codigo_alterno+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechacreacion+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariocreacion+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechamod+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariomod+"' "; 
                                if (contador==499) {
                                    CRUD.Updatedynamic(stringSentencia)
                                    NewQuery=true;
                                    stringSentencia="";
                                    contador=0;
                                }

                            }
                            else if (STEP_SINCRONIZACION[i] == ENTIDAD_USUARIOS  && DATOS_ENTIDADES_SINCRONIZACION[i].length!=0) {
                                //CRUD.insert('crm_contactos',DATOS_ENTIDADES_SINCRONIZACION[i][j]);
                                
                                if (NewQuery) {
                                    stringSentencia=" insert into s_usuarios  ";
                                    NewQuery=false;
                                }
                                else{
                                    stringSentencia+= "   UNION   ";
                                }
                                stringSentencia+=  "  SELECT  '"+
                                DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_empresa+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].identificacion+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].erp_codigo+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].nombre_usuario+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].nombre_completo+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].email+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].clave+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].ind_cambiarclave+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].acepto_condiciones+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].ind_activo+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_cia+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].descripcion+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].idioma+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].tipo_usuario+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].coordinador_canal_deault+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].superior_rowid+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_canal_superior+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechacreacion+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariocreacion+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechamod+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariomod+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_canal_vendedor+"' "; 
                                if (contador==499) {
                                    CRUD.Updatedynamic(stringSentencia)
                                    NewQuery=true;
                                    stringSentencia="";
                                    contador=0;
                                }

                            }
                            else if (STEP_SINCRONIZACION[i] == ENTIDAD_CANALES  && DATOS_ENTIDADES_SINCRONIZACION[i].length!=0) {
                                //CRUD.insert('crm_contactos',DATOS_ENTIDADES_SINCRONIZACION[i][j]);
                                
                                if (NewQuery) {
                                    stringSentencia=" insert into s_canales_usuario  ";
                                    NewQuery=false;
                                }
                                else{
                                    stringSentencia+= "   UNION   ";
                                }
                                stringSentencia+=  "  SELECT  '"+
                                DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_usuario+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_canal+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].nombre_canal+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuario_creacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fecha_creacion+"' "; 
                                if (contador==499) {
                                    CRUD.Updatedynamic(stringSentencia)
                                    NewQuery=true;
                                    stringSentencia="";
                                    contador=0;
                                }

                            } 
                            else if (STEP_SINCRONIZACION[i] == ENTIDAD_EXTENSION1  && DATOS_ENTIDADES_SINCRONIZACION[i].length!=0) {
                                //CRUD.insert('crm_contactos',DATOS_ENTIDADES_SINCRONIZACION[i][j]);
                                
                                if (NewQuery) {
                                    stringSentencia=" insert into erp_item_extension1  ";
                                    NewQuery=false;
                                }
                                else{
                                    stringSentencia+= "   UNION   ";
                                }
                                stringSentencia+=  "  SELECT  '"+
                                DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_cia+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_erp+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].erp_descripcion+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].erp_descripcion_corta+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariocreacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariomodificacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechacreacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechamodificacion+"' "; 
                                if (contador==499) {
                                    CRUD.Updatedynamic(stringSentencia)
                                    NewQuery=true;
                                    stringSentencia="";
                                    contador=0;
                                }

                            }
                            else if (STEP_SINCRONIZACION[i] == ENTIDAD_EXTENSION2  && DATOS_ENTIDADES_SINCRONIZACION[i].length!=0) {
                                //CRUD.insert('crm_contactos',DATOS_ENTIDADES_SINCRONIZACION[i][j]);
                                
                                if (NewQuery) {
                                    stringSentencia=" insert into erp_item_extension2  ";
                                    NewQuery=false;
                                }
                                else{
                                    stringSentencia+= "   UNION   ";
                                }
                                stringSentencia+=  "  SELECT  '"+
                                DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_cia+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_erp+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].erp_descripcion+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].erp_descripcion_corta+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariocreacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariomodificacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechacreacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechamodificacion+"' "; 
                                if (contador==499) {
                                    CRUD.Updatedynamic(stringSentencia)
                                    NewQuery=true;
                                    stringSentencia="";
                                    contador=0;
                                }

                            }
                            else if (STEP_SINCRONIZACION[i] == ENTIDAD_EXTENSION1_DETALLE  && DATOS_ENTIDADES_SINCRONIZACION[i].length!=0) {
                                //CRUD.insert('crm_contactos',DATOS_ENTIDADES_SINCRONIZACION[i][j]);
                                
                                if (NewQuery) {
                                    stringSentencia=" insert into erp_item_extencion1_detalle  ";
                                    NewQuery=false;
                                }
                                else{
                                    stringSentencia+= "   UNION   ";
                                }
                                stringSentencia+=  "  SELECT  '"+
                                DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_cia+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].extencion1ID+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_erp+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].erp_descripcion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].erp_descripcion_corta+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechacreacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariomodificacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechacreacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechamodificacion+"' "; 
                                if (contador==499) {
                                    CRUD.Updatedynamic(stringSentencia)
                                    NewQuery=true;
                                    stringSentencia="";
                                    contador=0;
                                }

                            }
                            else if (STEP_SINCRONIZACION[i] == ENTIDAD_EXTENSION2_DETALLE  && DATOS_ENTIDADES_SINCRONIZACION[i].length!=0) {
                                //CRUD.insert('crm_contactos',DATOS_ENTIDADES_SINCRONIZACION[i][j]);
                                
                                if (NewQuery) {
                                    stringSentencia=" insert into erp_item_extencion2_detalle  ";
                                    NewQuery=false;
                                }
                                else{
                                    stringSentencia+= "   UNION   ";
                                }
                                stringSentencia+=  "  SELECT  '"+
                                DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_cia+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].extencion2ID+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_erp+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].erp_descripcion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].erp_descripcion_corta+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechacreacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuariomodificacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechacreacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechamodificacion+"' "; 
                                if (contador==499) {
                                    CRUD.Updatedynamic(stringSentencia)
                                    NewQuery=true;
                                    stringSentencia="";
                                    contador=0;
                                }

                            }
                            else if (STEP_SINCRONIZACION[i] == ENTIDAD_ITEM_EXTENSION  && DATOS_ENTIDADES_SINCRONIZACION[i].length!=0) {
                                //CRUD.insert('crm_contactos',DATOS_ENTIDADES_SINCRONIZACION[i][j]);
                                
                                if (NewQuery) {
                                    stringSentencia=" insert into erp_items_extenciones  ";
                                    NewQuery=false;
                                }
                                else{
                                    stringSentencia+= "   UNION   ";
                                }
                                stringSentencia+=  "  SELECT  '"+
                                DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].id_cia+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].itemID+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].extencionDetalle1ID+
                                "', '"+DATOS_ENTIDADES_SINCRONIZACION[i][j].extencionDetalle2ID+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].indEstado+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechaInactivacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechaCreacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fotoID+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].notas+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuarioInactivacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuarioCreacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].usuarioModificacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].fechaDodificacion+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].extencion1ID+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].extencion2ID+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowIDmovtoEntidad+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].porMaxExcesoKit+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].porMinExcesoKit+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].UnidadValidacionID+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].BarrasPrincipalID+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].planKitID+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].itemExtGenID+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].rowid_erp+
                                "','"+DATOS_ENTIDADES_SINCRONIZACION[i][j].stock+"' "; 
                                if (contador==499) {
                                    CRUD.Updatedynamic(stringSentencia)
                                    NewQuery=true;
                                    stringSentencia="";
                                    contador=0;
                                }

                            }
                            else if (STEP_SINCRONIZACION[i] == ENTIDAD_GRAFICA_DIARIO  && DATOS_ENTIDADES_SINCRONIZACION[i].length!=0) {
                                
                                GRAFICA_DIA_LABEL[j]=DATOS_ENTIDADES_SINCRONIZACION[i][j].dia;
                                GRAFICA_DIA_CANTIDAD[j]=DATOS_ENTIDADES_SINCRONIZACION[i][j].cantidad;

                            }
                            else if (STEP_SINCRONIZACION[i] == ENTIDAD_GRAFICA_MENSUAL  && DATOS_ENTIDADES_SINCRONIZACION[i].length!=0) {
                                
                                GRAFICA_MES_LABEL[j]=DATOS_ENTIDADES_SINCRONIZACION[i][j].mes;
                                GRAFICA_MES_CANTIDAD[j]=DATOS_ENTIDADES_SINCRONIZACION[i][j].cantidad;

                            } 
                            else if (STEP_SINCRONIZACION[i] == TABLA_BALANCE  && DATOS_ENTIDADES_SINCRONIZACION[i].length!=0) {
                                
                                TABLA_BALANCE_DATOS[j]=DATOS_ENTIDADES_SINCRONIZACION[i][j];

                            } 
                        }
                        if (stringSentencia!='') {
                            CRUD.Updatedynamic(stringSentencia)
                            NewQuery=true;
                        }
                    }
                    localStorage.removeItem('TABLA_BALANCE'); 
                    localStorage.setItem('TABLA_BALANCE',JSON.stringify(TABLA_BALANCE_DATOS));
                    localStorage.removeItem('GRAFICA_MES_CANTIDAD'); 
                    localStorage.setItem('GRAFICA_MES_CANTIDAD',JSON.stringify(GRAFICA_MES_CANTIDAD));
                    localStorage.removeItem('GRAFICA_MES_LABEL');
                    localStorage.setItem('GRAFICA_MES_LABEL',JSON.stringify( GRAFICA_MES_LABEL));
                    localStorage.removeItem('GRAFICA_DIA_LABEL');
                    localStorage.setItem('GRAFICA_DIA_LABEL',JSON.stringify( GRAFICA_DIA_LABEL));
                    localStorage.removeItem('GRAFICA_DIA_CANTIDAD');
                    localStorage.setItem('GRAFICA_DIA_CANTIDAD',JSON.stringify(GRAFICA_DIA_CANTIDAD)); 
                window.setTimeout(function(){
                    ProcesadoHiden();
                    $route.reload();
                    Mensajes('Sincronizado Con Exito','success','')
                },7000)
                
                
            },OFFSET)
        },4000)

        //Traer Nuevos Datos
    }

}]);


app_angular.controller('appController',['Conexion','$scope','$location','$http', '$routeParams', 'Factory' ,function (Conexion, $scope, $location, $http, $routeParams, Factory) {
    
    if (window.localStorage.getItem("CUR_USER") == null || window.localStorage.getItem("CUR_USER")==undefined) {
        location.href='login.html';
        return;
    }
    
    if ($routeParams.url == undefined) {
   
    }
    else {
        console.log($routeParams);
        $scope.templateUrl = 'view/' + $routeParams.modulo + '/' + $routeParams.url + '.html';
    }
    $scope.CurrentDate=function(){
        $scope.day;
        $scope.DayNow=Date.now();
        $scope.YearS=$scope.DayNow.getFullYear();
        $scope.MonthS=$scope.DayNow.getMonth()+1;
        if ($scope.MonthS<10) {$scope.MonthS='0'+$scope.MonthS}
        $scope.DayS=$scope.DayNow.getDate();
        $scope.HourS=$scope.DayNow.getHours();
        $scope.MinuteS=$scope.DayNow.getMinutes();
        if ($scope.DayS<10) {$scope.DayS='0'+$scope.DayS}
        $scope.day=$scope.YearS+''+$scope.MonthS+''+$scope.DayS;
        return $scope.day;
    }
    $scope.GetMonth=function(){
        $scope.day;
        $scope.DayNow=Date.now();
        $scope.YearS=$scope.DayNow.getFullYear();
        $scope.MonthS=$scope.DayNow.getMonth()+1;
        if ($scope.MonthS<10) {$scope.MonthS='0'+$scope.MonthS}
        $scope.DayS=$scope.DayNow.getDate();
        $scope.HourS=$scope.DayNow.getHours();
        $scope.MinuteS=$scope.DayNow.getMinutes();
        if ($scope.DayS<10) {$scope.DayS='0'+$scope.DayS}
        $scope.day=$scope.YearS+''+$scope.MonthS+''+$scope.DayS;
        return $scope.MonthS;
    }
    $scope.SelectedDate=function(daySelected){
        $scope.day;
        $scope.DayNow=new Date(daySelected);
        $scope.YearS=$scope.DayNow.getFullYear();
        $scope.MonthS=$scope.DayNow.getMonth()+1;
        if ($scope.MonthS<10) {$scope.MonthS='0'+$scope.MonthS}
        $scope.DayS=$scope.DayNow.getDate();
        $scope.HourS=$scope.DayNow.getHours();
        $scope.MinuteS=$scope.DayNow.getMinutes();
        if ($scope.DayS<10) {$scope.DayS='0'+$scope.DayS}
        $scope.day=$scope.YearS+'-'+$scope.MonthS;
        return $scope.day;
    }
    $scope.RequestDate=function(day){
        $scope.day;
        $scope.DayNow=new Date(day);
        $scope.YearS=$scope.DayNow.getFullYear();
        $scope.MonthS=$scope.DayNow.getMonth()+1;
        if ($scope.MonthS<10) {$scope.MonthS='0'+$scope.MonthS}
        $scope.DayS=$scope.DayNow.getDate();
        $scope.HourS=$scope.DayNow.getHours();
        $scope.MinuteS=$scope.DayNow.getMinutes();
        if ($scope.DayS<10) {$scope.DayS='0'+$scope.DayS}
        $scope.day=$scope.YearS+'-'+$scope.MonthS+'-'+$scope.DayS;
        return $scope.day;
    }
    $scope.RequestDay=function(day){
        $scope.day;
        $scope.DayNow=new Date(day);
        $scope.YearS=$scope.DayNow.getFullYear();
        $scope.MonthS=$scope.DayNow.getMonth()+1;
        if ($scope.MonthS<10) {$scope.MonthS='0'+$scope.MonthS}
        $scope.DayS=$scope.DayNow.getDate();
        $scope.HourS=$scope.DayNow.getHours();
        $scope.MinuteS=$scope.DayNow.getMinutes();
        if ($scope.DayS<10) {$scope.DayS='0'+$scope.DayS}
        $scope.day=$scope.DayS;
        return $scope.day;
    }
    $scope.actividadesToday=[];

    var query="select  tema,descripcion,fecha_inicial,fecha_final ,replace(fecha_inicial,'-','') as fecha_inicialF,replace(fecha_final,'-','') as fecha_finalF from crm_actividades ";
    $scope.today=$scope.CurrentDate();
    CRUD.select(query,function(elem){
        var f1 = elem.fecha_inicialF.slice(0,8);
        var f2 = elem.fecha_finalF.slice(0,8);
        f1.replace(' ','');
        f2.replace(' ','');
        if (f1<=$scope.today) {
            if (f2>=$scope.today) {
                $scope.actividadesToday.push(elem);
            }
        }
    })

    /*$scope.cantidadTerceros=[];
    $scope.cantidadTerceros1=[];
    $scope.cantidadPedidos=[];
    $scope.cantidadPedidos1=[];
    $scope.estadisticagrafica=[];
    $scope.mes1=0;
    $scope.mes2=0;
    $scope.mes3=0;
    $scope.mes4=0;
    $scope.mes5=0;
    $scope.mes6=0;
    $scope.mes11=0;
    $scope.mes22=0;
    $scope.mes33=0;
    $scope.mes44=0;
    $scope.mes55=0;
    $scope.mes66=0;
    $scope.registros=[];
    $scope.validacion='';
    $scope.mesActual=$scope.GetMonth();
    $scope.labels=[];
    //CRUD.select('SELECT COUNT(*) as cantidad FROM erp_terceros',function(elem){$scope.cantidadTerceros.push(elem);$scope.cantidadTerceros1=$scope.cantidadTerceros[0];})
    CRUD.select("select count(*) as cantidad from erp_items ",function(elem){console.log(elem.cantidad)})
    CRUD.select('SELECT COUNT(*) as cantidad FROM t_pedidos',function(elem){$scope.cantidadPedidos.push(elem);$scope.cantidadPedidos1=$scope.cantidadPedidos[0];})
    var Count1=6;
    var cont=6;
    for (var i=1; i<Count1+1;i++) {
        //console.log(i)
        var dt = new Date();
        dt=dt.setMonth(dt.getMonth()+1 - i);

        var dt1=new Date(dt);
        dt1=$scope.SelectedDate(dt1)

        CRUD.select("select "+cont+" as cont,  '"+dt1+"' as f1,    strftime('%Y-%m', fechacreacion) as date,strftime('%m', fechacreacion) as mes,count(strftime('%m', fechacreacion)) as cantidad,sum(valor_total) as valor_total from t_pedidos  where   strftime('%Y-%m', fechacreacion) = '"+dt1+"' ",
        function(elem){$scope.estadisticagrafica.push(elem);
            
            if (elem.cont==1) {$scope.mes1=elem.valor_total;$scope.mes11=elem.f1;console.log(elem.date)};
            if (elem.cont==2) {$scope.mes2=elem.valor_total;$scope.mes22=elem.f1;console.log(elem.date)};
            if (elem.cont==3) {$scope.mes3=elem.valor_total;$scope.mes33=elem.f1};
            if (elem.cont==4) {$scope.mes4=elem.valor_total;$scope.mes44=elem.f1};
            if (elem.cont==5) {$scope.mes5=elem.valor_total;$scope.mes55=elem.f1};
            if (elem.cont==6) {$scope.mes6=elem.valor_total;$scope.mes66=elem.f1};
            $scope.registros=[[$scope.mes1,$scope.mes2,$scope.mes3,$scope.mes4,$scope.mes5,$scope.mes6]];
            $scope.labels = [$scope.mes11,$scope.mes22,$scope.mes33,$scope.mes44,$scope.mes55,$scope.mes66]; 
        })
        cont--
    }
    
    CRUD.select("select count(*) as cantidad from t_pedidos",function(elem){
        if (elem.cantidad==0) {
            $scope.validacion='No fue encontrado Ningun  Pedido'
        }
    })
    $scope.estadisiticaGraficaDiaria=[];
    $scope.variables=[];
    $scope.variables.name1=0;
    $scope.variables.name2=0;
    $scope.variables.name3=0;
    $scope.variables.name4=0;
    $scope.variables.name5=0;
    $scope.variables.name6=0;
    $scope.variables.name7=0;
    $scope.variables.name8=0;
    $scope.variables.name9=0;
    $scope.variables.name10=0;
    $scope.dataGD=[[0,0,0,0,0,0,0,0,0,0]];
    $scope.labelsGD=[0,0,0,0,0,0,0,0,0,0];
    var p2=10;
    for (var i=1;i<11;i++) {
        var v1 = new Date();
        var dayOfMonth = v1.getDate();
        v1=v1.setDate(dayOfMonth +1 - i);
        
        dayOfMonth=dayOfMonth+1-i;
        v1=new Date(v1);
        v1=$scope.RequestDate(v1)
        v2=$scope.RequestDay(v1)
        console.log(v1);
        var dataprueba="select "+p2+" as cont,  '"+v1+"' as f1,   '"+v2+"' as date,strftime('%m', fechacreacion) as mes,count(strftime('%m', fechacreacion)) as cantidad,sum(valor_total) as valor_total,count(rowid) as dataCount from t_pedidos  where   strftime('%Y-%m-%d', fechacreacion) = '"+v1+"'" ;
        
        CRUD.select("select "+p2+" as cont,  '"+v1+"' as f1,   '"+v2+"' as date,strftime('%m', fechacreacion) as mes,count(strftime('%m', fechacreacion)) as cantidad,sum(valor_total) as valor_total,count(rowid) as dataCount from t_pedidos  where   strftime('%Y-%m-%d', fechacreacion) = '"+v1+"' ",function(elem){
            
            $scope.estadisiticaGraficaDiaria.push(elem);
            if (elem.cont==1) {$scope.variables.dia1=elem.dataCount;$scope.variables.name1=elem.date};
            if (elem.cont==2) {$scope.variables.dia2=elem.dataCount;$scope.variables.name2=elem.date};
            if (elem.cont==3) {$scope.variables.dia3=elem.dataCount;$scope.variables.name3=elem.date};
            if (elem.cont==4) {$scope.variables.dia4=elem.dataCount;$scope.variables.name4=elem.date};
            if (elem.cont==5) {$scope.variables.dia5=elem.dataCount;$scope.variables.name5=elem.date};
            if (elem.cont==6) {$scope.variables.dia6=elem.dataCount;$scope.variables.name6=elem.date};
            if (elem.cont==7) {$scope.variables.dia7=elem.dataCount;$scope.variables.name7=elem.date};
            if (elem.cont==8) {$scope.variables.dia8=elem.dataCount;$scope.variables.name8=elem.date};
            if (elem.cont==9) {$scope.variables.dia9=elem.dataCount;$scope.variables.name9=elem.date};
            if (elem.cont==10) {$scope.variables.dia10=elem.dataCount;$scope.variables.name10=elem.date};
            $scope.dataGD=
            [[
                $scope.variables.dia1,
                $scope.variables.dia2,
                $scope.variables.dia3,
                $scope.variables.dia4,
                $scope.variables.dia5,
                $scope.variables.dia6,
                $scope.variables.dia7,
                $scope.variables.dia8,
                $scope.variables.dia9
                ,$scope.variables.dia10
            ]]
            $scope.labelsGD=
            [
                $scope.variables.name1,
                $scope.variables.name2,
                $scope.variables.name3,
                $scope.variables.name4,
                $scope.variables.name5,
                $scope.variables.name6,
                $scope.variables.name7,
                $scope.variables.name8,
                $scope.variables.name9
                ,$scope.variables.name10
            ]
        })   
        p2--; 
    }*/

    var GRAFICA_DIA_CANTIDAD=JSON.parse(window.localStorage.getItem("GRAFICA_DIA_CANTIDAD"));
    var GRAFICA_DIA_LABEL=JSON.parse(window.localStorage.getItem("GRAFICA_DIA_LABEL"));
    var GRAFICA_MES_CANTIDAD=JSON.parse(window.localStorage.getItem("GRAFICA_MES_CANTIDAD"));
    var GRAFICA_MES_LABEL=JSON.parse(window.localStorage.getItem("GRAFICA_MES_LABEL"));
    $scope.registros=[GRAFICA_MES_CANTIDAD];
    $scope.labels=GRAFICA_MES_LABEL;
    $scope.dataGD=[GRAFICA_DIA_CANTIDAD];
    $scope.labelsGD=GRAFICA_DIA_LABEL;
    $scope.data = [ [65, 59, 80, 81, 56, 55] ];
    $scope.colours=["#26B99A"];
    
   $scope.labels1 = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
    $scope.series1 = ['Pedidos'];

      $scope.data1 = [
        [65, 59, 80, 81, 56, 55, 40],
        [28, 48, 40, 19, 86, 27, 90]
      ];
}]);


//CONTROLADOR DE MENU
app_angular.controller('menuController', function ($scope, Factory) {
    $scope.menuList = [
        {
            nombre_opcion: 'Ventas', url: '#/', isSubmenu: true, icono: 'fa fa-bar-chart',
            submenu: [{nombre_opcion: 'Pedidos', url: '#/ventas/pedidos_ingresados'}
            ]
        },
        {
            nombre_opcion: 'Crm', url: '#/', isSubmenu: true, icono: 'icon-user',
            submenu: [{nombre_opcion: 'Clientes', url: '#/crm/terceros'}
            ]
        },
        {
            nombre_opcion: 'Configuracion', url: '#/', isSubmenu: true, icono: 'icon-cog',
            submenu: [{nombre_opcion: 'Mi Cuenta', url: '#/configuracion/mi_cuenta'}, {
                nombre_opcion: 'Cambiar Clave',
                url: '#/'
            }]
        }
    ];
});

//CONTROLADOR DEL LOGIN
app_angular.controller('loginController', function ($scope, Factory, $location, $http) {

    angular.element(document).ready(function () {
        "use strict";
        Login.init(); // Init login JavaScript
    });

    $scope.Login=function(){

        $http.get("https://api.github.com/users/codigofacilito/repos")
            .success(function (data) {
                
            })
            .error(function (err) {
                console.log("Error" + err);
            });

        //window.localStorage.setItem("user", "user:xxx;pass:xxxxxx;");

    }
});


//CONTROLADOR DE PANTALLA DE CALENDARIO
app_angular.controller('calendarioController', function ($scope, Factory) {
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    var h = {};

    if (angular.element('#calendar').width() <= 400) {
        h = {
            left: 'title',
            center: '',
            right: 'prev,next'
        };
    } else {
        h = {
            left: 'prev,next',
            center: 'title',
            right: 'month,agendaWeek,agendaDay'
        };
    }

    angular.element('#calendar').fullCalendar({
        disableDragging: false,
        header: h,
        editable: true,
        events: [{
            title: 'All Day Event',
            start: new Date(y, m, 1),
            backgroundColor: App.getLayoutColorCode('yellow')
        }, {
            title: 'Long Event',
            start: new Date(y, m, d - 5),
            end: new Date(y, m, d - 2),
            backgroundColor: App.getLayoutColorCode('green')
        }, {
            title: 'Repeating Event',
            start: new Date(y, m, d - 3, 16, 0),
            allDay: false,
            backgroundColor: App.getLayoutColorCode('red')
        }, {
            title: 'Repeating Event',
            start: new Date(y, m, d + 4, 16, 0),
            allDay: false,
            backgroundColor: App.getLayoutColorCode('green')
        }, {
            title: 'Meeting',
            start: new Date(y, m, d, 10, 30),
            allDay: false,
        }, {
            title: 'Lunch',
            start: new Date(y, m, d, 12, 0),
            end: new Date(y, m, d, 14, 0),
            backgroundColor: App.getLayoutColorCode('grey'),
            allDay: false,
        }, {
            title: 'Birthday Party',
            start: new Date(y, m, d + 1, 19, 0),
            end: new Date(y, m, d + 1, 22, 30),
            backgroundColor: App.getLayoutColorCode('purple'),
            allDay: false,
        }, {
            title: 'Click for Google',
            start: new Date(y, m, 28),
            end: new Date(y, m, 29),
            backgroundColor: App.getLayoutColorCode('yellow'),
            url: 'http://google.com/',
        }
        ]
    });
});