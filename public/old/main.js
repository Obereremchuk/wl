
function msg(text){
    $("#log").prepend(text + "<br/>"); }// Print message to log

var prod_value;// переменная для выбора уведомлений по продукту
var dns = "http://navi.venbest.com.ua";// Wialon site dns
var token;

function init() { // Получаем, фильтруем ресурс1, ресурс2, объект, имя пользователя
    var sess = wialon.core.Session.getInstance(); // get instance of current Session
//specify what kind of data should be returned (diffrent flags for 'avl_unit' and 'avl_resource')
    var flags_res =  wialon.item.Item.dataFlag.base | wialon.item.Item.accessFlag.setItemsAccess | wialon.item.Item.accessFlag.setAcl;
    var user_flags = wialon.item.Item.dataFlag.base | wialon.item.User.dataFlag.flags | wialon.item.Item.dataFlag.CustomProps; 
    var flags_units = wialon.item.Item.dataFlag.base | wialon.item.Unit.dataFlag.restricted;
    var mappss=0x00000800;
    var $username = $("#username").val(); // имя нового юзера из формы
    var $searchBox = $("#searchBox").val();//Поле для отбора нужного объекта
    sess.loadLibrary("resourceNotifications"); // load Notification Library 
    sess.updateDataFlags( // load items to current session
            [{type: "type", data: "avl_resource", flags: flags_res, mode: 0}, // Items (avl_resource) specification
            {type: "type", data: "avl_unit", flags: flags_units, mode: 0}, // Items (avl_unit) specification
            {type: "type", data: "user", flags: user_flags, mode: 0}, // Items (user) specification
            {type: "type", data: "mapps", flags: mappss, mode: 0}], // Items (map) specification
            function (code) { // updateDataFlags callback
                if (code) {
                    msg(wialon.core.Errors.getErrorText(code)+", Необходимо авторизироватся!"); 
                    return; }
// get loaded 'avl_resource's items with edit notification access 
                var res = wialon.util.Helper.filterItems(sess.getItems("avl_resource"),
                wialon.item.Resource.accessFlag.editNotifications);
// construct Select list using found resources "name"
                for (var i = 0; i< res.length; i++) 
                    $("#res").append("<option value='"+ res[i].getId() +"'>"+ res[i].getName() +"</option>");
                    $("#res :contains('_user')option").remove();//Убираем все что не содержит _user
                    $("#res :not(:contains("+$username+"))option").remove();//Убираем все что не содержит username
                    $("#res :contains("+$username+")").attr("selected", "selected");//выбираем из списка содержащий $username
// construct Select list using found resources "name_user"
                for (var i = 0; i< res.length; i++)
                    $("#res2").append("<option value='"+ res[i].getId() +"'>"+ res[i].getName() +"</option>");
                    $("#res2 :not(:contains('_user'))option").remove();//Убираем все что не содержит _user
                    $("#res2 :not(:contains("+$username+"))option").remove();//Убираем все что не содержит username
                    $("#res2 :contains('_user')").attr("selected", "selected");//выбираем из списка содержащий _user
// get loaded 'avl_unit's items
                var units = sess.getItems("avl_unit");
// construct Select list using found units
                for (var i = 0; i< units.length; i++) 
                    $("#units").append("<option value='"+ units[i].getId() +"'>"+ units[i].getUniqueId()+ " (" + units[i].getName() + ")" +"</option>");
                    $("#units :not(:contains("+$searchBox+"))option").remove();//Убираем все что не содержит строку для поиска $searchBox
// get loaded 'users's items                       
                var users = sess.getItems("user");                        
// construct Select list using found users                        
                for (var i = 0; i< users.length; i++) 
                    $("#users").append("<option value='"+ users[i].getId() +"'>"+ users[i].getName() +"</option>");
                    $("#users :not(:contains("+$username+"))option").hide();//Убираем все что не содержит username
                    $("#users :contains("+$username+")").attr("selected", "selected");//выбираем из списка содержащий $username
    });// получаем, фильтруем ресурс1, ресурс2, пользователь, объект

}

function createuser(){
    var user = wialon.core.Session.getInstance().getCurrUser();
    var username = $("#username").val(); // имя нового юзера из формы
    if(!username || username.indexOf(' ') >= 0 ){
        msg("Введите верное имя пользователя");
        return; 
    }//проверка на пробелы в имени пользователя, стоп
    var passw = $("#passw").val(); // пароль для нового юзера из формы
    if(!passw){
        msg("Введите пароль"); 
        return;
    } // Проверка на невведен пароль, стоп
    var flag = 1; //флаг
    var skipCreatorCheck = 1; //флаг
    wialon.core.Session.getInstance().createUser(user, username, passw, flag, function(code, obj) {//create username
        if (code != 0){ 
            msg(wialon.core.Errors.getErrorText(code)); 
            return ; 
        }
        var newuser = obj;
        console.log("User created: '" + username + "'"); //выводим в лог созданного пользователя
        wialon.core.Session.getInstance().createResource(newuser, username, flag, skipCreatorCheck, function(code, obj1) { //create resurce 1
            if (code != 0){
            alert(wialon.core.Errors.getErrorText(code));
            return; 
        }
            console.log("Resources 1 created: '" + username + "'"); //выводим в лог созданный ресурс1
            wialon.core.Session.getInstance().createResource(newuser, username + "_user", flag, skipCreatorCheck, function(code, obj2) { //create resurce 2
                if (code != 0){
                    alert(wialon.core.Errors.getErrorText(code));
                    return;
                }
                console.log("Resources 2 created: '" + username + "_user'"); //выводим в лог созданный ресурс2   
                msg("Создано пользователя и два ресурса");
            });//Создаем ресурс 2
        })//Создаем ресурс 1, ресурс2
    });//Созаем пользователя, ресурс1, ресурс2
}//Созаем пользователя, ресурс1, ресурс2

function set_access(){
    var sess = wialon.core.Session.getInstance();    
    var unit=$("#units").val();
    if(!unit){
        msg("Выберите Объект"); 
        return; 
    } // проверка: объект выбран?
    var res=$("#res").val();
    if(!res){ 
        msg("Выберите ресурс"); 
        return;
    }// проверка: ресурс выбран?
    var res2=$("#res2").val();
    if(!res2){ 
        msg("Выберите ресурс2"); 
        return;
    }// проверка: ресурс2 выбран?
    var id_usr=$("#users").val();
    if(!id_usr){
        msg("Выберите User"); 
        return;
    }  // проверка: пользователь выбран?    
    
    var flag_opus=52810916888575; ////Права на ресурсы нового пользователя для o.pustovit
    //var usr_opus_id="27";
    var usr_opus = sess.getItem("27");//Загружаем данные пользователя: o.pustovit
    usr_opus.updateItemAccess(sess.getItem( res ), flag_opus, function(code){
        if (code != 0){
            alert(wialon.core.Errors.getErrorText(code));
            return;
        }
        console.log("access to res1 for o.pustovit Done");
    });//Устанавливаем права на русурс1 для пользователю: o.pustovit
    
    usr_opus.updateItemAccess(sess.getItem( res2 ), flag_opus, function(code){
        if (code != 0){
            alert(wialon.core.Errors.getErrorText(code));
            return;
        }
        console.log("access to res2 for o.pustovit Done");
    });//Устанавливаем права на русурс2 для пользователю: o.pustovit
    
    var flag_opus_new_user=-1; //FULL Права на учетку нового пользователя для o.pustovit;
    var usr_opus = sess.getItem("27");//Загружаем данные пользователя: o.pustovit id:27
    usr_opus.updateItemAccess(sess.getItem( id_usr ), flag_opus_new_user, function(code){
        if (code != 0){
            alert(wialon.core.Errors.getErrorText(code));
            return;
        }
        console.log("Full access to new user for o.pustovit Done");
    });//Устанавливаем Full права на учетку нового пользователя: o.pustovit
    
    var flag_dlenik=52810916888575;//Права на ресурсы нового пользователя для d.lenik
    var usr_dlenik = sess.getItem("1066");//Загружаем данные пользователя: d.lenik id:1066
    usr_dlenik.updateItemAccess(sess.getItem( res ), flag_dlenik, function(code){
        if (code != 0){
            alert(wialon.core.Errors.getErrorText(code));
            return;
        }
        console.log("access to res1 for d.lenik Done");
    });//Устанавливаем права на русурс1 для пользователю: d.lenik 
    usr_dlenik.updateItemAccess(sess.getItem( res2 ), flag_dlenik, function(code){
        if (code != 0){
            alert(wialon.core.Errors.getErrorText(code));
            return;
        } 
        console.log("access to res2 for d.lenik Done");
    });//Устанавливаем права на русурс2 для пользователю: d.lenik 
    
    var userr = sess.getItem( id_usr );//Загружаем данные пользователя: нового пользователя   
    
    var flag_res=4648339329; // Права на ресурс1 для нового пользователя
    userr.updateItemAccess(sess.getItem( res ), flag_res, function(code){
        if (code != 0){
            alert(wialon.core.Errors.getErrorText(code));
            return;
        }
        console.log("access to res Done");
    });//Устанавливаем права на русурс1 для нового пользователя.
    
    var flag_res_user=52785134440321; // Права на ресурс2 для нового пользователя   
    userr.updateItemAccess(sess.getItem( res2 ), flag_res_user, function(code){
        if (code != 0){
            alert(wialon.core.Errors.getErrorText(code));
            return;
        }
        console.log("access to res_user Done");
    });//Устанавливаем права на русурс2 для нового пользователя.  
    
    var mask_flag_usr = 23; // Маска на права настройки пользователя новому юзеру
    var flag_usr = 0; //Права настройки пользователя новому юзеру
    userr.updateUserFlags(flag_usr, mask_flag_usr, function(code){
        if (code != 0){
            alert(wialon.core.Errors.getErrorText(code));
            return;
        }
        console.log("access to User Done :");
    }); //Устанавливаем права на настройки пользователя для нового пользователя.   
    
    var flag_unit=550594678661;//Права на оъект новому юзеру
    userr.updateItemAccess(sess.getItem( unit ), flag_unit, function(code){
        if (code != 0){
            alert(wialon.core.Errors.getErrorText(code));
            return;
        }
        console.log("access to unit Done");
    });//Устанавливаем права на объект для нового пользователя.
    
    var loc;
    if (document.getElementById('Locale1').checked) {
        Locale();
        loc = " ,настройки локализации";
        
    }
    msg("Установлены права для пользователя, объекта и двум ресурам"+ loc)
}//Устанавливаем права.

function Locale(){
    var userId=$("#users").val(); //check for select user
    var user = wialon.core.Session.getInstance().getItem(userId);//Загружаем данные нового юзера 
    var curruser = wialon.core.Session.getInstance().getCurrUser();//Загружаем данные юзера под которым вошли 
    var curruser_tz = 184753184;//curruser.getCustomProperty("tz");//Загружаем настройки временной зоны юзера под которым вошли 
    var curruser_dst = -1;//curruser.getCustomProperty("dst");//Загружаем настройки летнего времени юзера под которым вошли    
    console.log("Usrname:"+ curruser.getName()+"ToUser:" + user +", tz:"+ curruser_tz+", dst:"+ curruser_dst);// выводим в лог данные текущего юзера под которым вошли
    user.updateCustomProperty("tz", curruser_tz);//Устанавливаем настройки временной зоны с юзера под клторым вошли, юзеру которого создаем
    user.updateCustomProperty("dst", curruser_dst);//Устанавливаем настройки летнеее время с юзера под клторым вошли, юзеру которого создаем   
//        You can get user in 3 ways:
//1) by id
//var user =  wialon.core.Session.getInstance().getItem(id);   
//console.log(user);
//
//2) by name        
//var spec = {itemsType: "user", propName: "sys_name", propValueMask: "name", sortType: ""};
//wialon.core.Session.getInstance().searchItems(spec, 2, wialon.item.Item.dataFlag.base, 0, 0, qx.lang.Function.bind(function(code, result) {            
//    if (code || !result || typeof result.items == "undefined" || !result.items.length)
//        return;
//    console.log(result.items[0]);
//}, this));
//
//3) get current user
//var user = wialon.core.Session.getInstance().getCurrUser();
//console.log(user);
//
//note for 1) and 2): you can only get those users that you can access according access rights

}// Настройка локализации пользователя - летнее время, часовой пояс

function createNotification_CP(){
    console.log("start creation CP notification");
    var res = wialon.core.Session.getInstance().getItem($("#res").val()); //Загружаем данные выбраного из списка ресурс1
    if(!res){
        msg("Выбери ресурс");
        return; 
    }; //Проверянм: Ресурс выбран?
    var un = $("#units").val(); //Загружаем данные выбраного из списка объекта
    if(!un){
        msg("Select units"); 
        return; 
    } //Проверянм: объект выбран?
    var id_usr=$("#users").val();
    
    if (document.getElementById('no_email').checked ==false) {
        var first_email = $("#first_email").val();
        if(!first_email){
            msg("Не заполнено поле Email");
            return; };//Проверка: поле Email Заполнено?
        var sec_email = $("#sec_email").val();
        if(!sec_email){
            sec_email = first_email;
        };
        var tri_email = $("#sec_email").val();
        if(!tri_email){ 
            tri_email = first_email;
        }; 
    } //отключение поле Email 
    wialon.core.Session.getInstance().loadLibrary("mobileApps");
    var app = "{\"Wialon Local\""+":"+"["+id_usr+"]"+"}";//Выбор пользователя для мобильных уведомлений

    // construct Notifiacation object ТРЕВОЖНАЯ КНОПКА
    if (document.getElementById('no_email').checked ==false){
        var obj1 = { 
            ma:0, fl:1, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: "#ff0000"}}, 
                    {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: НАЖАТА ТРЕВОЖНАЯ КНОПКА!!!!! Время сработки: %MSG_TIME%. В %POS_TIME% объект двигался со скоростью %SPEED% около '%LOCATION%'.",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "ТРЕВОЖНАЯ КНОПКА", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: { t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Тревожная кнопка", sensor_type: "digital", type: 0, upper_bound: "1"}}
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true){
        var obj1 = { ma:0, fl:1, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: "#ff0000"}},
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: НАЖАТА ТРЕВОЖНАЯ КНОПКА!!!!! Время сработки: %MSG_TIME%. В %POS_TIME% объект двигался со скоростью %SPEED% около '%LOCATION%'.",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "ТРЕВОЖНАЯ КНОПКА", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Тревожная кнопка", sensor_type: "digital", type: 0, upper_bound: "1"}}
        };
    }//Опции уведомлений без Email
    res.createNotification(obj1, function(code){ // create Notification callback
        if(code){
            msg(wialon.core.Errors.getErrorText(code)); 
            msg("error Notification ТРЕВОЖНАЯ КНОПКА created CP");
            return;
        }
        console.log("Notification ТРЕВОЖНАЯ КНОПКА created"); // print create succeed message
    }); //Создаем уведомление

    // construct Notifiacation object Сработка: Датчики взлома
    if (document.getElementById('no_email').checked ==false){
        var obj2 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: Несанкционированное открытие дверей, капота или багажника. Время сработки: %MSG_TIME%. Автомобиль находился около '%LOCATION%'.",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "Сработка: Датчики взлома", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Сработка сигнализации: двери", sensor_type: "digital", type: 0, upper_bound: "1"}}      
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true){
        var obj2 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                {t:"event", p:{flags: 0}},
                {"t":"mobile_apps","p":{"apps":app}}
            ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: Несанкционированное открытие дверей, капота или багажника. Время сработки: %MSG_TIME%. Автомобиль находился около '%LOCATION%'.",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "Сработка: Датчики взлома", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value",p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Сработка сигнализации: двери", sensor_type: "digital", type: 0, upper_bound: "1"}}      
        };
    }//Опции уведомлений без Email
    res.createNotification(obj2, function(code){ // create Notification callback
        if(code){
            msg(wialon.core.Errors.getErrorText(code)); 
            msg("error Notification Сработка: Датчики взлома created");
            return;
        } 
        console.log("Notification Сработка: Датчики взлома created");
    });//Создаем уведомление

    // construct Notifiacation object Сработка сигнализации: зажигание
    if (document.getElementById('no_email').checked ==false){
        var obj3 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: Несанкционированное включение зажигания. Время сработки: %MSG_TIME%. Автомобиль находился около '%LOCATION%'.",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "Сработка: Включено зажигание", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Сработка сигнализации: зажигание", sensor_type: "digital", type: 0, upper_bound: "1"}}      
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true){
        var obj3 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: Несанкционированное включение зажигания. Время сработки: %MSG_TIME%. Автомобиль находился около '%LOCATION%'.",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "Сработка: Включено зажигание", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Сработка сигнализации: зажигание", sensor_type: "digital", type: 0, upper_bound: "1"}}      
        };
    }//Опции уведомлений без Email
    res.createNotification(obj3, function(code){ // create Notification callback
        if(code){ 
            msg(wialon.core.Errors.getErrorText(code));
            msg("error Notification Сработка сигнализации: зажигание created");
            return;
        }
        console.log("Notification Сработка сигнализации: зажигание created"); // print create succeed message
    });//Создаем уведомление

    // construct Notifiacation object Низкое напряжения АКБ
    if (document.getElementById('no_email').checked ==false){
        var obj4 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: низкое напряжение АКБ. Автомобиль находился около '%LOCATION%'.",
            mmtd: 0, cdt: 0, mast: 300, mpst: 0, cp: 0, // default values
            n: "Низкое напряжения АКБ", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 0, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Напряжение АКБ", sensor_type: "voltage", type: 0, upper_bound: "11.08"}}      
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true){
        var obj4 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: низкое напряжение АКБ. Автомобиль находился около '%LOCATION%'.",
            mmtd: 0, cdt: 0, mast: 300, mpst: 0, cp: 0, // default values
            n: "Низкое напряжения АКБ", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 0, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Напряжение АКБ", sensor_type: "voltage", type: 0, upper_bound: "11.08"}}      
        };
    }//Опции уведомлений без Email
    res.createNotification(obj4, function(code){ // create Notification callback
        if(code){ 
            msg(wialon.core.Errors.getErrorText(code));
            msg("error Notification Низкое напряжения АКБ created");
            return;
        } // exit if error code
        console.log("Notification Низкое напряжения АКБ created"); // print create succeed message
    });//Создаем уведомление

    // construct Notifiacation object НЕ ЗАКРЫТЫ ДВЕРИ/КАПОТ/БАГАЖНИК В ОХРАНЕ
    if (document.getElementById('no_email').checked ==false){
        var obj5 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: БЫЛИ НЕ ЗАКРЫТЫ ДВЕРИ/КАПОТ ИЛИ БАГАЖНИК ПРИ ПОСТАНОВКЕ НА ОХРАНУ. %POS_TIME% он двигался со скоростью %SPEED% около '%LOCATION%'.",
            mmtd: 0, cdt: 0, mast: 30, mpst: 0, cp: 0, // default values
            n: "НЕ ЗАКРЫТЫ ДВЕРИ/КАПОТ/БАГАЖНИК В ОХРАНЕ", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Не закрыты двери в охране", sensor_type: "digital", type: 0, upper_bound: "1"}}
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true){
        var obj5 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: БЫЛИ НЕ ЗАКРЫТЫ ДВЕРИ/КАПОТ ИЛИ БАГАЖНИК ПРИ ПОСТАНОВКЕ НА ОХРАНУ. %POS_TIME% он двигался со скоростью %SPEED% около '%LOCATION%'.",
            mmtd: 0, cdt: 0, mast: 30, mpst: 0, cp: 0, // default values
            n: "НЕ ЗАКРЫТЫ ДВЕРИ/КАПОТ/БАГАЖНИК В ОХРАНЕ", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Не закрыты двери в охране", sensor_type: "digital", type: 0, upper_bound: "1"}}
        };
    }//Опции уведомлений без Email
    res.createNotification(obj5, function(code){ // create Notification callback
        if(code)                {
           msg(wialon.core.Errors.getErrorText(code));
           msg("error Notification НЕ ЗАКРЫТЫ ДВЕРИ/КАПОТ/БАГАЖНИК В ОХРАНЕ created");
           return;
        } // exit if error code
        console.log("Notification НЕ ЗАКРЫТЫ ДВЕРИ/КАПОТ/БАГАЖНИК В ОХРАНЕ created"); // print create succeed message
    });//Создаем уведомление

    // construct Notifiacation object Блокировка двигателя
    if (document.getElementById('no_email').checked ==false){
        var obj6 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: Произошла блокировка двигателя. Время сработки: %MSG_TIME%  В %POS_TIME% автомобиль двигался со скоростью %SPEED% около '%LOCATION%'.",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "Блокировка двигателя", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Блокировка иммобилайзера", sensor_type: "digital", type: 0, upper_bound: "1"}}
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true){
        var obj6 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: Произошла блокировка двигателя. Время сработки: %MSG_TIME%  В %POS_TIME% автомобиль двигался со скоростью %SPEED% около '%LOCATION%'.",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "Блокировка двигателя", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Блокировка иммобилайзера", sensor_type: "digital", type: 0, upper_bound: "1"}}
        };
    }//Опции уведомлений без Email
    res.createNotification(obj6,function(code){ // create Notification callback
                if(code){ 
                    msg(wialon.core.Errors.getErrorText(code));
                    msg("error Notification Блокировка двигателя created");
                    return;
                } // exit if error code
                console.log("Notification Блокировка двигателя created"); // print create succeed message
    });//Создаем уведомление

    // construct Notifiacation object Cработка: Датчик удара/наклона/буксировки
    if (document.getElementById('no_email').checked ==false){
    var obj7 = { ma:0, fl:0, tz:7200, la:"ru", mpst:60,
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: сработал датчик удара/наклона/буксировки. Время сработки: %MSG_TIME%. В %POS_TIME% автомобиль находился около '%LOCATION%'.",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "Cработка: Датчик удара/наклона/буксировки", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Датчик удара", sensor_type: "digital", type: 0, upper_bound: "1"}}
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true){
        var obj7 = { ma:0, fl:0, tz:7200, la:"ru", mpst:60,
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: сработал датчик удара/наклона/буксировки. Время сработки: %MSG_TIME%. В %POS_TIME% автомобиль находился около '%LOCATION%'.",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "Cработка: Датчик удара/наклона/буксировки", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Датчик удара", sensor_type: "digital", type: 0, upper_bound: "1"}}      
        };
    }//Опции уведомлений без Email
    res.createNotification(obj7, function(code){ // create Notification callback
        if(code){ 
            msg(wialon.core.Errors.getErrorText(code));
            msg("error Notification Cработка: Датчик удара/наклона/буксировки created");
            return;
        } // exit if error code
        console.log("Notification Cработка: Датчик удара/наклона/буксировки created"); // print create succeed message
    });//Создаем уведомление

    // construct Notifiacation object Cработка: ГЛУШЕНИЕ GSM (ДВИЖЕНИЕ)        
    if (document.getElementById('no_email').checked ==false){
        var obj8 = { ma:0, fl:0, tz:7200, la:"ru",  mpst:60,
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: Глушение  сигнала Дата и время сообщения: %MSG_TIME%",
            mmtd: 0, cdt: 0, mast: 0, mpst: 60, cp: 0, // default values
            n: "ГЛУШЕНИЕ GSM (ДВИЖЕНИЕ)", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "ГЛУШЕНИЕ GSM (ДВИЖЕНИЕ)", sensor_type: "digital", type: 0, upper_bound: "1"}}
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true){
    var obj8 = { ma:0, fl:0, tz:7200, la:"ru",  mpst:60,
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: Глушение  сигнала Дата и время сообщения: %MSG_TIME%",
            mmtd: 0, cdt: 0, mast: 0, mpst: 60, cp: 0, // default values
            n: "ГЛУШЕНИЕ GSM (ДВИЖЕНИЕ)", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "ГЛУШЕНИЕ GSM (ДВИЖЕНИЕ)", sensor_type: "digital", type: 0, upper_bound: "1"}}
        };
    }//Опции уведомлений без Email
    res.createNotification(obj8, function(code){ // create Notification callback
        if(code){ 
            msg(wialon.core.Errors.getErrorText(code));
            msg("error Notification ГЛУШЕНИЕ GSM (ДВИЖЕНИЕ)");
            return;
        } // exit if error code
        console.log("Notification ГЛУШЕНИЕ GSM (ДВИЖЕНИЕ)"); // print create succeed message
    });//Создаем уведомление

    // construct Notifiacation object ГЛУШЕНИЕ GSM (ПАРКИНГ)        
    if (document.getElementById('no_email').checked ==false){
        var obj9 = { ma:0, fl:0, tz:7200, la:"ru",
            act: [  {t:"message", p:{color: "2"}}, 
                    {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: Глушение  сигнала В %POS_TIME% объект двигался со скоростью %SPEED% около '%LOCATION%'. Дата и время сообщения: %MSG_TIME%",
            mmtd: 0, cdt: 0, mast: 0, mpst: 60, cp: 0, // default values
            n: "ГЛУШЕНИЕ GSM (ПАРКИНГ)", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "ГЛУШЕНИЕ GSM (ПАРКИНГ)", sensor_type: "digital", type: 0, upper_bound: "1"}}
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true){
        var obj9 = { ma:0, fl:0, tz:7200, la:"ru",
            act: [  {t:"message", p:{color: "2"}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: Глушение  сигнала В %POS_TIME% объект двигался со скоростью %SPEED% около '%LOCATION%'. Дата и время сообщения: %MSG_TIME%",
            mmtd: 0, cdt: 0, mast: 0, mpst: 60, cp: 0, // default values
            n: "ГЛУШЕНИЕ GSM (ПАРКИНГ)", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "ГЛУШЕНИЕ GSM (ПАРКИНГ)", sensor_type: "digital", type: 0, upper_bound: "1"}}
        };
    }//Опции уведомлений без Email
    res.createNotification(obj9, function(code){ // create Notification callback
        if(code){ 
            msg(wialon.core.Errors.getErrorText(code));
            msg("error Notification ГЛУШЕНИЕ GSM (ПАРКИНГ)");
            return;
        } // exit if error code
        console.log("Notification ГЛУШЕНИЕ GSM (ПАРКИНГ)"); // print create succeed message
    });//Создаем уведомление

    msg("CP 9 уведомлений создано");
}//Создаем уведомления для Connect Plus

function createNotification_CNTK(){
    console.log("start creation CNTK notification");
    var res = wialon.core.Session.getInstance().getItem($("#res").val()); //Загружаем данные выбраного из списка ресурс1
    if(!res){
        msg("Выбери ресурс");
        return; 
    }; //Проверянм: Ресурс выбран?
    var un = $("#units").val(); //Загружаем данные выбраного из списка объекта
    if(!un){
        msg("Select units"); 
        return; 
    } //Проверянм: объект выбран?
    var id_usr=$("#users").val();
    
    if (document.getElementById('no_email').checked ==false) {
        var first_email = $("#first_email").val();
        if(!first_email){
            msg("Не заполнено поле Email");
            return; };//Проверка: поле Email Заполнено?
        var sec_email = $("#sec_email").val();
        if(!sec_email){
            sec_email = first_email;
        };
        var tri_email = $("#sec_email").val();
        if(!tri_email){ 
            tri_email = first_email;
        }; 
    } //отключение поле Email 
    wialon.core.Session.getInstance().loadLibrary("mobileApps");
    var app = "{\"Wialon Local\""+":"+"["+id_usr+"]"+"}";//Выбор пользователя для мобильных уведомлений

    // construct Notifiacation object ТРЕВОЖНАЯ КНОПКА
    if (document.getElementById('no_email').checked ==false){
        var obj1 = { 
            ma:0, fl:1, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: "#ff0000"}}, 
                    {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: НАЖАТА ТРЕВОЖНАЯ КНОПКА!!!!! Время сработки: %MSG_TIME%. В %POS_TIME% объект двигался со скоростью %SPEED% около '%LOCATION%'.",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "ТРЕВОЖНАЯ КНОПКА", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: { t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Тревожная кнопка", sensor_type: "digital", type: 0, upper_bound: "1"}}
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true){
        var obj1 = { ma:0, fl:1, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: "#ff0000"}},
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: НАЖАТА ТРЕВОЖНАЯ КНОПКА!!!!! Время сработки: %MSG_TIME%. В %POS_TIME% объект двигался со скоростью %SPEED% около '%LOCATION%'.",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "ТРЕВОЖНАЯ КНОПКА", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Тревожная кнопка", sensor_type: "digital", type: 0, upper_bound: "1"}}
        };
    }//Опции уведомлений без Email
    res.createNotification(obj1, function(code){ // create Notification callback
        if(code){
            msg(wialon.core.Errors.getErrorText(code)); 
            msg("error Notification ТРЕВОЖНАЯ КНОПКА created CP");
            return;
        }
        console.log("Notification ТРЕВОЖНАЯ КНОПКА created"); // print create succeed message
    }); //Создаем уведомление

    // construct Notifiacation object Сработка: Датчики взлома
    if (document.getElementById('no_email').checked ==false){
        var obj2 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: Несанкционированное открытие дверей, капота или багажника. Время сработки: %MSG_TIME%. Автомобиль находился около '%LOCATION%'.",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "Сработка: Датчики взлома", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Сработка сигнализации: двери", sensor_type: "digital", type: 0, upper_bound: "1"}}      
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true){
        var obj2 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                {t:"event", p:{flags: 0}},
                {"t":"mobile_apps","p":{"apps":app}}
            ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: Несанкционированное открытие дверей, капота или багажника. Время сработки: %MSG_TIME%. Автомобиль находился около '%LOCATION%'.",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "Сработка: Датчики взлома", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value",p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Сработка сигнализации: двери", sensor_type: "digital", type: 0, upper_bound: "1"}}      
        };
    }//Опции уведомлений без Email
    res.createNotification(obj2, function(code){ // create Notification callback
        if(code){
            msg(wialon.core.Errors.getErrorText(code)); 
            msg("error Notification Сработка: Датчики взлома created");
            return;
        } 
        console.log("Notification Сработка: Датчики взлома created");
    });//Создаем уведомление

    // construct Notifiacation object Низкое напряжения АКБ
    if (document.getElementById('no_email').checked ==false){
        var obj4 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: низкое напряжение АКБ. Автомобиль находился около '%LOCATION%'.",
            mmtd: 0, cdt: 0, mast: 300, mpst: 0, cp: 0, // default values
            n: "Низкое напряжения АКБ", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 0, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Напряжение АКБ", sensor_type: "voltage", type: 0, upper_bound: "11.08"}}      
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true){
        var obj4 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: низкое напряжение АКБ. Автомобиль находился около '%LOCATION%'.",
            mmtd: 0, cdt: 0, mast: 300, mpst: 0, cp: 0, // default values
            n: "Низкое напряжения АКБ", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 0, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Напряжение АКБ", sensor_type: "voltage", type: 0, upper_bound: "11.08"}}      
        };
    }//Опции уведомлений без Email
    res.createNotification(obj4, function(code){ // create Notification callback
        if(code){ 
            msg(wialon.core.Errors.getErrorText(code));
            msg("error Notification Низкое напряжения АКБ created");
            return;
        } // exit if error code
        console.log("Notification Низкое напряжения АКБ created"); // print create succeed message
    });//Создаем уведомление

    // construct Notifiacation object НЕ ЗАКРЫТЫ ДВЕРИ/КАПОТ/БАГАЖНИК В ОХРАНЕ
    if (document.getElementById('no_email').checked ==false){
        var obj5 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: БЫЛИ НЕ ЗАКРЫТЫ ДВЕРИ/КАПОТ ИЛИ БАГАЖНИК ПРИ ПОСТАНОВКЕ НА ОХРАНУ. %POS_TIME% он двигался со скоростью %SPEED% около '%LOCATION%'.",
            mmtd: 0, cdt: 0, mast: 30, mpst: 0, cp: 0, // default values
            n: "НЕ ЗАКРЫТЫ ДВЕРИ/КАПОТ/БАГАЖНИК В ОХРАНЕ", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Не закрыты двери в охране", sensor_type: "digital", type: 0, upper_bound: "1"}}
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true){
        var obj5 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: БЫЛИ НЕ ЗАКРЫТЫ ДВЕРИ/КАПОТ ИЛИ БАГАЖНИК ПРИ ПОСТАНОВКЕ НА ОХРАНУ. %POS_TIME% он двигался со скоростью %SPEED% около '%LOCATION%'.",
            mmtd: 0, cdt: 0, mast: 30, mpst: 0, cp: 0, // default values
            n: "НЕ ЗАКРЫТЫ ДВЕРИ/КАПОТ/БАГАЖНИК В ОХРАНЕ", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Не закрыты двери в охране", sensor_type: "digital", type: 0, upper_bound: "1"}}
        };
    }//Опции уведомлений без Email
    res.createNotification(obj5, function(code){ // create Notification callback
        if(code)                {
           msg(wialon.core.Errors.getErrorText(code));
           msg("error Notification НЕ ЗАКРЫТЫ ДВЕРИ/КАПОТ/БАГАЖНИК В ОХРАНЕ created");
           return;
        } // exit if error code
        console.log("Notification НЕ ЗАКРЫТЫ ДВЕРИ/КАПОТ/БАГАЖНИК В ОХРАНЕ created"); // print create succeed message
    });//Создаем уведомление

    // construct Notifiacation object Блокировка двигателя
    if (document.getElementById('no_email').checked ==false){
        var obj6 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: Произошла блокировка двигателя. Время сработки: %MSG_TIME%  В %POS_TIME% автомобиль двигался со скоростью %SPEED% около '%LOCATION%'.",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "Блокировка двигателя", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Блокировка иммобилайзера", sensor_type: "digital", type: 0, upper_bound: "1"}}
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true){
        var obj6 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: Произошла блокировка двигателя. Время сработки: %MSG_TIME%  В %POS_TIME% автомобиль двигался со скоростью %SPEED% около '%LOCATION%'.",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "Блокировка двигателя", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Блокировка иммобилайзера", sensor_type: "digital", type: 0, upper_bound: "1"}}
        };
    }//Опции уведомлений без Email
    res.createNotification(obj6,function(code){ // create Notification callback
                if(code){ 
                    msg(wialon.core.Errors.getErrorText(code));
                    msg("error Notification Блокировка двигателя created");
                    return;
                } // exit if error code
                console.log("Notification Блокировка двигателя created"); // print create succeed message
    });//Создаем уведомление

    // construct Notifiacation object Cработка: Датчик удара/наклона/буксировки
    if (document.getElementById('no_email').checked ==false){
    var obj7 = { ma:0, fl:0, tz:7200, la:"ru", mpst:60,
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: сработал датчик удара/наклона/буксировки. Время сработки: %MSG_TIME%. В %POS_TIME% автомобиль находился около '%LOCATION%'.",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "Cработка: Датчик удара/наклона/буксировки", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Датчик удара", sensor_type: "digital", type: 0, upper_bound: "1"}}
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true){
        var obj7 = { ma:0, fl:0, tz:7200, la:"ru", mpst:60,
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: сработал датчик удара/наклона/буксировки. Время сработки: %MSG_TIME%. В %POS_TIME% автомобиль находился около '%LOCATION%'.",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "Cработка: Датчик удара/наклона/буксировки", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Датчик удара", sensor_type: "digital", type: 0, upper_bound: "1"}}      
        };
    }//Опции уведомлений без Email
    res.createNotification(obj7, function(code){ // create Notification callback
        if(code){ 
            msg(wialon.core.Errors.getErrorText(code));
            msg("error Notification Cработка: Датчик удара/наклона/буксировки created");
            return;
        } // exit if error code
        console.log("Notification Cработка: Датчик удара/наклона/буксировки created"); // print create succeed message
    });//Создаем уведомление

    msg("CNTK 6 уведомлений создано");
}//Создаем уведомления для Connect Plus

function createNotification_CMM(){ //create notification
    console.log("start creation CMM notification");
    var res = wialon.core.Session.getInstance().getItem($("#res").val()); //Загружаем данные выбраного из списка ресурс1
    if(!res){
        msg("Выбери ресурс");
        return; 
    };//Проверянм: Ресурс выбран?
    var un = $("#units").val(); //Загружаем данные выбраного из списка объекта
    if(!un){
        msg("Select units");
        return;
    } //Проверянм: объект выбран?
    var id_usr=$("#users").val();
    if (document.getElementById('no_email').checked ==false) {
        var first_email = $("#first_email").val();
        if(!first_email){
            msg("Не заполнено поле Email");
            return; 
        };//Проверка: поле Email Заполнено?
        var sec_email = $("#sec_email").val();
        if(!sec_email){
            sec_email = first_email;
        };
        var tri_email = $("#sec_email").val();
        if(!tri_email){
            tri_email = first_email;
        };
    }//отключение поле Email 
    wialon.core.Session.getInstance().loadLibrary("mobileApps");
    var app = "{\"Wialon Local\""+":"+"["+id_usr+"]"+"}";//Выбор пользователя для мобильных уведомлений

    // construct Notifiacation object ТРЕВОЖНАЯ КНОПКА
    if (document.getElementById('no_email').checked ==false) {
        var obj1 = { ma:0, fl:0, tz:7200, la:"ru", 
                act: [  {t:"message", p:{color: "#ff0000"}}, 
                        {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                        {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                        {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                        {t:"event", p:{flags: 0}},
                        {"t":"mobile_apps","p":{"apps":app}}
                    ], // default values
                sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
                txt: "%UNIT%: %MSG_TIME% Нажата тревожная кнопка",
                mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
                n: "СММ: Тревожная кнопка (B)", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
                trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Тревожная кнопка", sensor_type: "any", type: 0, upper_bound: "1"}}
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true) {
        var obj1 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: "#ff0000"}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: %MSG_TIME% Нажата тревожная кнопка",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "СММ: Тревожная кнопка (B)", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Тревожная кнопка", sensor_type: "any", type: 0, upper_bound: "1"}}
        };  
    }//Опции уведомлений без Email
    res.createNotification(obj1,function(code){ // create Notification callback
        if(code){
            msg(wialon.core.Errors.getErrorText(code)); 
            msg("error Notification ТРЕВОЖНАЯ КНОПКА created CMM");
            return;
        }
        console.log("Notification ТРЕВОЖНАЯ КНОПКА created CMM"); // print create succeed message
    }); //Создаем уведомление

    // construct Notifiacation object Сработка: Датчики взлома
    if (document.getElementById('no_email').checked ==false) {
        var obj2 = { ma:0, fl:0, tz:7200, la:"ru", 
                act: [  {t:"message", p:{color: ""}}, 
                        {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                        {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                        {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                        {t:"event", p:{flags: 0}},
                        {"t":"mobile_apps","p":{"apps":app}}
                    ], // default values
                sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
                txt: "%UNIT%: %MSG_TIME% 	Сработал датчик взлома",
                mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
                n: "СММ: Сработал датчик взлома (B)", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
                trg: {t:"sensor_value",p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Датчик взлома", sensor_type: "any", type: 0, upper_bound: "1"}} 
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true) {
        var obj2 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                   {t:"event", p:{flags: 0}},
                   {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: %MSG_TIME% 	Сработал датчик взлома",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "СММ: Сработал датчик взлома (B)", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value",p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Датчик взлома", sensor_type: "any", type: 0, upper_bound: "1"}}
        };       
    }//Опции уведомлений без Email
    res.createNotification(obj2,function(code){ // create Notification callback
        if(code){
            msg(wialon.core.Errors.getErrorText(code)); 
            msg("error Notification Сработка: Датчики взлома created CMM");
            return;
        } // exit if error code
        console.log("Notification Сработка: Датчики взлома created CMM");
    });//Создаем уведомление

    // construct Notifiacation object Сработка сигнализации: зажигание
    if (document.getElementById('no_email').checked ==false) {
        var obj3 =  { ma:0, fl:1, tz:7200, la:"ru", 
                act: [  {t:"message", p:{color: ""}}, 
                        {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                        {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                        {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                        {t:"event", p:{flags: 0}},
                        {"t":"mobile_apps","p":{"apps":app}}
                    ], // default values
                sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
                txt: "%UNIT%: %MSG_TIME% 	Включено зажигание в охране",
                mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
                n: "СММ: Зажигание в охране (B)", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
                trg: {t:"sensor_value",p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Зажигание в охране", sensor_type: "any", type: 0, upper_bound: "1"}}
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true) {
        var obj3 =  { ma:0, fl:1, tz:7200, la:"ru", 
                    act: [  {t:"message", p:{color: ""}}, 
                            {t:"event", p:{flags: 0}},
                            {"t":"mobile_apps","p":{"apps":app}}
                        ], // default values
                    sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
                    txt: "%UNIT%: %MSG_TIME% 	Включено зажигание в охране",
                    mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
                    n: "СММ: Зажигание в охране (B)", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
                    trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Зажигание в охране", sensor_type: "any", type: 0, upper_bound: "1"}}
        }; 
    }//Опции уведомлений без Email
    res.createNotification(obj3, function(code){ // create Notification callback
        if(code){ 
            msg(wialon.core.Errors.getErrorText(code));
            msg("error Notification Сработка сигнализации: зажигание created CMM");
            return;
        }
        console.log("Notification Сработка сигнализации: зажигание created CMM"); // print create succeed message
    });

    // construct Notifiacation object Низкое напряжения АКБ
    if (document.getElementById('no_email').checked ==false) {
        var obj4 = { ma:0, fl:1, tz:7200, la:"ru", 
                act: [  {t:"message", p:{color: ""}}, 
                        {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                        {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                        {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                        {t:"event", p:{flags: 0}},
                        {"t":"mobile_apps","p":{"apps":app}}
                    ], // default values
                sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
                txt: "%UNIT%: %MSG_TIME% 	Разряжен основной аккумулятор.",
                mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
                n: "СММ: Разряжен основной аккумулятор (B)", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
                trg: {t:"sensor_value",p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Аккумулятор разряжен", sensor_type: "any", type: 0, upper_bound: 1}}  
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true) {
        var obj4 = { ma:0, fl:1, tz:7200, la:"ru", 
                act: [  {t:"message", p:{color: ""}}, 
                        {t:"event", p:{flags: 0}},
                        {"t":"mobile_apps","p":{"apps":app}}
                    ], // default values
                sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
                txt: "%UNIT%: %MSG_TIME% 	Разряжен основной аккумулятор.",
                mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
                n: "СММ: Разряжен основной аккумулятор (B)", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
                trg: {t:"sensor_value",p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Аккумулятор разряжен", sensor_type: "any", type: 0, upper_bound: 1}}
        };        
    }//Опции уведомлений без Email
    res.createNotification(obj4, function(code){ // create Notification callback
        if(code){ 
            msg(wialon.core.Errors.getErrorText(code));
            msg("error Notification Низкое напряжения АКБ created CMM");
            return;
        } // exit if error code
        console.log("Notification Низкое напряжения АКБ created CMM"); // print create succeed message
    });//Создаем уведомление

    // construct Notifiacation object Основной аккумулятор отключен
    if (document.getElementById('no_email').checked ==false) {
        var obj5 = { ma:0, fl:1, tz:7200, la:"ru", 
                act: [  {t:"message", p:{color: ""}}, 
                        {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                        {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                        {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                        {t:"event", p:{flags: 0}},
                        {"t":"mobile_apps","p":{"apps":app}}
                    ], // default values
                sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
                txt: "%UNIT%: %MSG_TIME% 	Основной аккумулятор отключен",
                mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
                n: "СММ: Основной аккумулятор отключен (B)", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
                trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Аккумулятор отключен", sensor_type: "any", type: 0, upper_bound: "1"}}
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true) {
        var obj5 = { ma:0, fl:1, tz:7200, la:"ru", 
                act: [  {t:"message", p:{color: ""}}, 
                        {t:"event", p:{flags: 0}},
                        {"t":"mobile_apps","p":{"apps":app}}
                    ], // default values
                sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
                txt: "%UNIT%: %MSG_TIME% 	Основной аккумулятор отключен",
                mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
                n: "СММ: Основной аккумулятор отключен (B)", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
                trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Аккумулятор отключен", sensor_type: "any", type: 0, upper_bound: "1"}}
        };        
    }//Опции уведомлений без Email
    res.createNotification(obj5,function(code){ // create Notification callback
        if(code){
           msg(wialon.core.Errors.getErrorText(code));
           msg("error Notification Основной аккумулятор отключен created CMM");
           return;
        } // exit if error code
        console.log("Notification Основной аккумулятор отключен created CMM"); // print create succeed message
    });

    // construct Notifiacation object Блокировка двигателя
    if (document.getElementById('no_email').checked ==false) {
    var obj6 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: %MSG_TIME% Двигатель заблокирован",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "СММ: Двигатель заблокирован", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"msg_param", p: {text_mask: "*b*", param: "data_state", type : "1", kind: 1}}
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true) {
        var obj6 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: %MSG_TIME% Двигатель заблокирован",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "СММ: Двигатель заблокирован", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"msg_param", p: {text_mask: "*b*", param: "data_state", type : "1", kind: 1}}
        };        
    }//Опции уведомлений без Email
    res.createNotification(obj6, function(code){ // create Notification callback
        if(code){ 
            msg(wialon.core.Errors.getErrorText(code));
            msg("error Notification Блокировка двигателя created CMM");
            return;
        } // exit if error code
        console.log("Notification Блокировка двигателя created CMM"); // print create succeed message
    });//Создаем уведомление

    // construct Notifiacation object Cработка: Датчик наклона
    if (document.getElementById('no_email').checked ==false) {
        var obj7 = { ma:0, fl:1, tz:7200, la:"ru", mpst:60,
                act: [  {t:"message", p:{color: ""}}, 
                        {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                        {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                        {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                        {t:"event", p:{flags: 0}},
                        {"t":"mobile_apps","p":{"apps":app}}
                    ], // default values
                sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
                txt: "%UNIT%: %MSG_TIME% 	Сработал датчик наклона",
                mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
                n: "СММ: Сработал датчик наклона (B)", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
                trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Датчик наклона", sensor_type: "any", type: 0, upper_bound: "1"}}
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true) {
        var obj7 = { ma:0, fl:1, tz:7200, la:"ru", mpst:60,
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: %MSG_TIME% 	Сработал датчик наклона",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "СММ: Сработал датчик наклона (B)", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Датчик наклона", sensor_type: "any", type: 0, upper_bound: "1"}}
        };        
    }//Опции уведомлений без Email
    res.createNotification(obj7, function(code){ // create Notification callback
        if(code){ 
            msg(wialon.core.Errors.getErrorText(code));
            msg("error Notification Cработка: Датчик удара/наклона/буксировки created CMM");
            return;
        } // exit if error code
        console.log("Notification Cработка: Датчик удара/наклона/буксировки created CMM"); // print create succeed message
    });//Создаем уведомление

          // construct Notifiacation object Cработка: Датчик удара        
    if (document.getElementById('no_email').checked ==false) {
        var obj8 = { ma:0, fl:1, tz:7200, la:"ru",  mpst:60,
                act: [  {t:"message", p:{color: ""}}, 
                        {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                        {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                        {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                        {t:"event", p:{flags: 0}},
                        {"t":"mobile_apps","p":{"apps":app}}
                    ], // default values
                sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
                txt: "%UNIT%: %MSG_TIME% Сработал датчик удара",
                mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
                n: "СММ: Сработал датчик удара (B)", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
                trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Датчик удара", sensor_type: "any", type: 0, upper_bound: "1"}}
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true) {
        var obj8 = { ma:0, fl:1, tz:7200, la:"ru",  mpst:60,
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: %MSG_TIME% Сработал датчик удара",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "СММ: Сработал датчик удара (B)", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Датчик удара", sensor_type: "any", type: 0, upper_bound: "1"}}
        };        
    }//Опции уведомлений без Email
    res.createNotification(obj8, function(code){ // create Notification callback
        if(code){ 
            msg(wialon.core.Errors.getErrorText(code));
            msg("error Notification Датчик удара CMM");
            return;
        } // exit if error code
        console.log("Notification Датчик удара CMM"); // print create succeed message
    });//Создаем уведомление


          // construct Notifiacation object Cработка: Сирена       
    if (document.getElementById('no_email').checked ==false) {
        var obj9 = { ma:0, fl:0, tz:7200, la:"ru",
                act: [  {t:"message", p:{color: ""}}, 
                        {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                        {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                        {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                        {t:"event", p:{flags: 0}},
                        {"t":"mobile_apps","p":{"apps":app}}
                    ], // default values
                sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
                txt: "%UNIT%: %MSG_TIME% Сработала сирена",
                mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
                n: "СММ: Сработала сирена", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
                trg: {t:"msg_param", p: { text_mask: "*f*p*", param: "data_state", type: "1", kind: 1}}
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true) {
        var obj9 = { ma:0, fl:0, tz:7200, la:"ru",
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: %MSG_TIME% Сработала сирена",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "СММ: Сработала сирена", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"msg_param", p: { text_mask: "*f*p*", param: "data_state", type: "1", kind: 1}}
        };
    }//Опции уведомлений без Email
    res.createNotification(obj9, function(code){ // create Notification callback
        if(code){ 
            msg(wialon.core.Errors.getErrorText(code));
            msg("error Notification Cработка: Сирена CMM");
            return;
        } // exit if error code
        console.log("Notification Cработка: Сирена  CMM"); // print create succeed message
    });//Создаем уведомление

    msg("CMM 9 уведомлений создано");
}//Создаем уведомления для Connect Magnum Moto

function createNotification_CMA(){ //create notification
    console.log("start creation CMM notification");
    var res = wialon.core.Session.getInstance().getItem($("#res").val()); //Загружаем данные выбраного из списка ресурс1
    if(!res){
        msg("Выбери ресурс");
        return; 
    }; //Проверянм: Ресурс выбран?
    var un = $("#units").val(); //Загружаем данные выбраного из списка объекта
    if(!un){
        msg("Select units");
        return; 
    } //Проверянм: объект выбран?
    var id_usr=$("#users").val();
    if (document.getElementById('no_email').checked ==false) {
    var first_email = $("#first_email").val();
    if(!first_email){
        msg("Email то забыл ввеси, а?");
        return; 
    };//Проверка: поле Email Заполнено?
    var sec_email = $("#sec_email").val();
    if(!sec_email){
        sec_email = first_email;
    };
    var tri_email = $("#sec_email").val();
    if(!tri_email){
        tri_email = first_email;
    }; 
    }//отключение поле Email
    wialon.core.Session.getInstance().loadLibrary("mobileApps");
    var app = "{\"Wialon Local\""+":"+"["+id_usr+"]"+"}";//Выбор пользователя для мобильных уведомлений

    // construct Notifiacation object ТРЕВОЖНАЯ КНОПКА
    if (document.getElementById('no_email').checked ==false) {
        var obj1 = { ma:0, fl:0, tz:7200, la:"ru", 
                act: [  {t:"message", p:{color: "#ff0000"}}, 
                        {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                        {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                        {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                        {t:"event", p:{flags: 0}},
                        {"t":"mobile_apps","p":{"apps":app}}
                    ], // default values
                sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
                txt: "%UNIT%: %MSG_TIME% Нажата тревожная кнопка",
                mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
                n: "CMA: Нажата тревожная кнопка (B)", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
                trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Тревожная кнопка", sensor_type: "any", type: 0, upper_bound: "1"}}
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true) {
        var obj1 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: "#ff0000"}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: %MSG_TIME% Нажата тревожная кнопка",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "CMA: Нажата тревожная кнопка (B)", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Тревожная кнопка", sensor_type: "any", type: 0, upper_bound: "1"}}
        };
    }//Опции уведомлений без Email
    res.createNotification(obj1, function(code){ // create Notification callback
        if(code){
            msg(wialon.core.Errors.getErrorText(code)); 
            msg("error Notification ТРЕВОЖНАЯ КНОПКА created CMA");
            return;
        }
        console.log("Notification ТРЕВОЖНАЯ КНОПКА created CMA"); // print create succeed message
    }); //Опции уведомлений без Email

    // construct Notifiacation object Сработка: Датчики взлома
    if (document.getElementById('no_email').checked ==false) {
        var obj2 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: %MSG_TIME% Сработал датчик взлома",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "СМA: Сработал датчик взлома (B)", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Датчик взлома", sensor_type: "any", type: 0, upper_bound: "1"}}
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true) {
        var obj2 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: %MSG_TIME% Сработал датчик взлома",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "СМA: Сработал датчик взлома (B)", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Датчик взлома", sensor_type: "any", type: 0, upper_bound: "1"}}
        };
    }//Опции уведомлений без Email
    res.createNotification(obj2, function(code){ // create Notification callback
        if(code){
            msg(wialon.core.Errors.getErrorText(code)); 
            msg("error Notification Сработка: Датчики взлома created CMA");
            return;
        } // exit if error code
        console.log("Notification Сработка: Датчики взлома created CMA");
    });//Опции уведомлений без Email

    // construct Notifiacation object Сработка сигнализации: зажигание
    if (document.getElementById('no_email').checked ==false) {
        var obj3 =  { ma:0, fl:1, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: %MSG_TIME% Включено зажигание в охране",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "CMA: Зажигание в охране (B)", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Зажигание в охране", sensor_type: "any", type: 0, upper_bound: "1"}}
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true) {
        var obj3 =  { ma:0, fl:1, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: %MSG_TIME% Включено зажигание в охране",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "CMA: Зажигание в охране (B)", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Зажигание в охране", sensor_type: "any", type: 0, upper_bound: "1"}}
        };
    }//Опции уведомлений без Email
    res.createNotification(obj3, function(code){ // create Notification callback
        if(code){ 
            msg(wialon.core.Errors.getErrorText(code));
            msg("error Notification Сработка сигнализации: зажигание created CMA");
            return;
        }
        console.log("Notification Сработка сигнализации: зажигание created CMA"); // print create succeed message
    });//Опции уведомлений без Email

    // construct Notifiacation object Низкое напряжения АКБ
    if (document.getElementById('no_email').checked ==false) {
        var obj4 = { ma:0, fl:1, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: %MSG_TIME% Разряжен основной аккумулятор.",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "CMA: Разряжен основной аккумулятор (B)", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Аккумулятор разряжен", sensor_type: "any", type: 0, upper_bound: 1}}
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true) {
        var obj4 = { ma:0, fl:1, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: %MSG_TIME% Разряжен основной аккумулятор.",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "CMA: Разряжен основной аккумулятор (B)", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Аккумулятор разряжен", sensor_type: "any", type: 0, upper_bound: 1}}
        };
    }//Опции уведомлений без Email
    res.createNotification(obj4, function(code){ // create Notification callback
        if(code){ 
            msg(wialon.core.Errors.getErrorText(code));
            msg("error Notification Низкое напряжения АКБ created CMA");
            return;
        } // exit if error code
        console.log("Notification Низкое напряжения АКБ created CMA"); // print create succeed message
    });//Опции уведомлений без Email

    // construct Notifiacation object Основной аккумулятор отключен
    if (document.getElementById('no_email').checked ==false) {
        var obj5 = { ma:0, fl:1, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: %MSG_TIME% Основной аккумулятор отключен",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "СМA: Основной аккумулятор отключен (B)", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Аккумулятор отключен", sensor_type: "any", type: 0, upper_bound: "1"}}      
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true) {
        var obj5 = { ma:0, fl:1, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: %MSG_TIME% Основной аккумулятор отключен",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "СМA: Основной аккумулятор отключен (B)", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Аккумулятор отключен", sensor_type: "any", type: 0, upper_bound: "1"}}
        };
    }//Опции уведомлений без Email
    res.createNotification(obj5, function(code){ // create Notification callback
        if(code){
           msg(wialon.core.Errors.getErrorText(code));
           msg("error Notification Основной аккумулятор отключен created CMA");
           return;
        } // exit if error code
        console.log("Notification Основной аккумулятор отключен created CMA"); // print create succeed message
    });//Опции уведомлений без Email

    // construct Notifiacation object Блокировка двигателя
    if (document.getElementById('no_email').checked ==false) {
    var obj6 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: %MSG_TIME% Двигатель заблокирован",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "СМA: Двигатель заблокирован", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"msg_param", p: {text_mask: "*b*", param: "data_state", type : "1", kind: 1}}
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true) {
        var obj6 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: %MSG_TIME% Двигатель заблокирован",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "СМA: Двигатель заблокирован", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"msg_param", p: {text_mask: "*b*", param: "data_state", type : "1", kind: 1}}
        };
    }//Опции уведомлений без Email
    res.createNotification(obj6, function(code){ // create Notification callback
        if(code){ 
            msg(wialon.core.Errors.getErrorText(code));
            msg("error Notification Блокировка двигателя created CMA");
            return;
        } // exit if error code
        console.log("Notification Блокировка двигателя created CMA"); // print create succeed message
    });//Опции уведомлений без Email

    // construct Notifiacation object Cработка: Датчик наклона
    if (document.getElementById('no_email').checked ==false) {
        var obj7 = { ma:0, fl:1, tz:7200, la:"ru", mpst:60,
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: %MSG_TIME% Сработал датчик наклона",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "СМA: Сработал датчик наклона (B)", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Датчик наклона", sensor_type: "any", type: 0, upper_bound: "1"}}
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true) {
        var obj7 = { ma:0, fl:1, tz:7200, la:"ru", mpst:60,
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: %MSG_TIME% Сработал датчик наклона",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "СМA: Сработал датчик наклона (B)", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Датчик наклона", sensor_type: "any", type: 0, upper_bound: "1"}}
        };
    }//Опции уведомлений без Email
    res.createNotification(obj7, function(code){ // create Notification callback
        if(code){ 
            msg(wialon.core.Errors.getErrorText(code));
            msg("error Notification Cработка: Датчик удара/наклона/буксировки created CMA");
            return;
        } // exit if error code
        console.log("Notification Cработка: Датчик удара/наклона/буксировки created CMA"); // print create succeed message
    });//Опции уведомлений без Email

    // construct Notifiacation object Cработка: Датчик удара        
    if (document.getElementById('no_email').checked ==false) {
    var obj8 = { ma:0, fl:1, tz:7200, la:"ru",  mpst:60,
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: %MSG_TIME% Сработал датчик удара",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "СМA: Сработал датчик удара (B)", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Датчик удара", sensor_type: "any", type: 0, upper_bound: "1"}}
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true) {
        var obj8 = { ma:0, fl:1, tz:7200, la:"ru",  mpst:60,
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: %MSG_TIME% Сработал датчик удара",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "СМA: Сработал датчик удара (B)", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Датчик удара", sensor_type: "any", type: 0, upper_bound: "1"}}
        };
    }//Опции уведомлений без Email
    res.createNotification(obj8, function(code){ // create Notification callback
        if(code){ 
            msg(wialon.core.Errors.getErrorText(code));
            msg("error Notification Датчик удара CMA");
            return;
        } // exit if error code
        console.log("Notification Датчик удара CMA"); // print create succeed message
    });//Опции уведомлений без Email

    // construct Notifiacation object Cработка: Сирена       
    if (document.getElementById('no_email').checked ==false) {
    var obj9 = { ma:0, fl:0, tz:7200, la:"ru",
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: %MSG_TIME% Сработала сирена",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "СМA: Сработала сирена", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"msg_param",p: { text_mask: "*f*p*", param: "data_state", type: "1", kind: 1}}
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true) {
        var obj9 = { ma:0, fl:0, tz:7200, la:"ru",
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: %MSG_TIME% Сработала сирена",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "СМA: Сработала сирена", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"msg_param", p: { text_mask: "*f*p*", param: "data_state", type: "1", kind: 1}}      
        };
    }//Опции уведомлений без Email
    res.createNotification(obj9,function(code){ // create Notification callback
        if(code){ 
            msg(wialon.core.Errors.getErrorText(code));
            msg("error Notification Cработка: Сирена CMA");
            return;
        } // exit if error code
        console.log("Notification Cработка: Сирена  CMA"); // print create succeed message
    });//Опции уведомлений без Email
    
    // construct Notifiacation object Cработка: Сирена       
    if (document.getElementById('no_email').checked ==false) {
        var obj10 = { ma:0, fl:0, tz:7200, la:"ru",
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: %MSG_TIME% Установлено в охрану с открытыми дверьми",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "CMA: Установлено в охрану с открытыми дверьми", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"msg_param", p: { text_mask: "*id*o1*", param: "data_state", type: "1", kind: 1}}      
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true) {
        var obj10 = { ma:0, fl:0, tz:7200, la:"ru",
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: %MSG_TIME% Установлено в охрану с открытыми дверьми",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "CMA: Установлено в охрану с открытыми дверьми", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"msg_param", p: { text_mask: "*id*o1*", param: "data_state", type: "1", kind: 1}}      
        };
    }//Опции уведомлений без Email
    res.createNotification(obj10, function(code){ // create Notification callback
        if(code){ 
            msg(wialon.core.Errors.getErrorText(code));
            msg("error Notification Cработка: Установлено в охрану с открытыми дверьми CMA");
            return;
        } // exit if error code
        console.log("Notification Cработка: Установлено в охрану с открытыми дверьми  CMA"); // print create succeed message
    });//Опции уведомлений без Email

    msg("CMA 10 уведомлений создано");
}//Создаем уведомления для CMA

function createNotification_WATCH(){ //create notification
    console.log("start creation WATCH notification");
    var res = wialon.core.Session.getInstance().getItem($("#res").val()); //Загружаем данные выбраного из списка ресурс1
    if(!res){
        msg("Выбери ресурс");
        return; 
    }; //Проверянм: Ресурс выбран?
    var un = $("#units").val(); //Загружаем данные выбраного из списка объекта
    if(!un){
        msg("Select units");
        return; 
    } //Проверянм: объект выбран?
    var id_usr=$("#users").val();
    if (document.getElementById('no_email').checked ==false) {
    var first_email = $("#first_email").val();
    if(!first_email){
        msg("Email то забыл ввеси, а?");
        return; 
    };//Проверка: поле Email Заполнено?
    var sec_email = $("#sec_email").val();
    if(!sec_email){
        sec_email = first_email;
    };
    var tri_email = $("#sec_email").val();
    if(!tri_email){
        tri_email = first_email;
    }; 
    }//отключение поле Email
    wialon.core.Session.getInstance().loadLibrary("mobileApps");
    var app = "{\"Wialon Local\""+":"+"["+id_usr+"]"+"}";//Выбор пользователя для мобильных уведомлений

    // construct Notifiacation object ТРЕВОЖНАЯ КНОПКА
    if (document.getElementById('no_email').checked ==false) {
        var obj1 = { ma:0, fl:1, tz:7200, la:"ru", 
                act: [  {t:"message", p:{color: "#ff0000"}}, 
                        {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                        {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                        {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                        {t:"event", p:{flags: 0}},
                        {"t":"mobile_apps","p":{"apps":app}}
                    ], // default values
                sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
                txt: "Нажата тревожная кнопка на часах %UNIT%.",
                mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
                n: "W: Тревожная кнопка", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
                trg: {t:"alarm", p: {}}
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true) {
        var obj1 = { ma:0, fl:1, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: "#ff0000"}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "Нажата тревожная кнопка на часах %UNIT%.",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "W: Тревожная кнопка", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"alarm", p: {}}
        };
    }//Опции уведомлений без Email
    res.createNotification(obj1, function(code){ // create Notification callback
        if(code){
            msg(wialon.core.Errors.getErrorText(code)); 
            msg("error creation WATCH notification");
            return;
        }
        console.log("creation WATCH notification"); // print create succeed message
    }); //Опции уведомлений без Email

    // construct Notifiacation object Низкй заряд АКБ
    if (document.getElementById('no_email').checked ==false){
        var obj4 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: уровень заряда батареи  ниже 20 % Зарядите часы!",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "W: Низкий заряд АКБ", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 0, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Заряд АКБ", sensor_type: "custom", type: 0, upper_bound: "20"}}      
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true){
        var obj4 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: уровень заряда батареи  ниже 20 % Зарядите часы!",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "W: Низкий заряд АКБ", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 0, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Заряд АКБ", sensor_type: "custom", type: 0, upper_bound: "20"}}      
        };
    }//Опции уведомлений без Email
    res.createNotification(obj4, function(code){ // create Notification callback
        if(code){ 
            msg(wialon.core.Errors.getErrorText(code));
            msg("error Notification Низкое напряжения АКБ created");
            return;
        } // exit if error code
        console.log("Notification уровень заряда батареи  ниже 20 created"); // print create succeed message
    });//Создаем уведомление
    msg("Watch 2 уведомлений создано");
}//Создаем уведомления для WATCH

function createNotification_UBER(){ //create notification
    console.log("start creation WATCH notification");
    var res = wialon.core.Session.getInstance().getItem($("#res").val()); //Загружаем данные выбраного из списка ресурс1
    if(!res){
        msg("Выбери ресурс");
        return; 
    }; //Проверянм: Ресурс выбран?
    var un = $("#units").val(); //Загружаем данные выбраного из списка объекта
    if(!un){
        msg("Select units");
        return; 
    } //Проверянм: объект выбран?
    var id_usr=$("#users").val();
    if (document.getElementById('no_email').checked ==false) {
    var first_email = $("#first_email").val();
    if(!first_email){
        msg("Email то забыл ввеси, а?");
        return; 
    };//Проверка: поле Email Заполнено?
    var sec_email = $("#sec_email").val();
    if(!sec_email){
        sec_email = first_email;
    };
    var tri_email = $("#sec_email").val();
    if(!tri_email){
        tri_email = first_email;
    }; 
    }//отключение поле Email
    wialon.core.Session.getInstance().loadLibrary("mobileApps");
    var app = "{\"Wialon Local\""+":"+"["+id_usr+"]"+"}";//Выбор пользователя для мобильных уведомлений

    // construct Notifiacation object ТРЕВОЖНАЯ КНОПКА
    if (document.getElementById('no_email').checked ==false) {
        var obj1 = { ma:0, fl:1, tz:7200, la:"ru", 
                act: [  {t:"message", p:{color: "#ff0000"}}, 
                        {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                        {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                        {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                        {t:"event", p:{flags: 0}},
                        {"t":"mobile_apps","p":{"apps":app}}
                    ], // default values
                sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
                txt: "Нажата тревожная кнопка %UNIT%.",
                mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
                n: "S: Кнопка тревоги", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
                trg: {t:"alarm", p: {}}
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true) {
        var obj1 = { ma:0, fl:1, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: "#ff0000"}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "Нажата тревожная кнопка %UNIT%.",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "S: Кнопка тревоги", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"alarm", p: {}}
        };
    }//Опции уведомлений без Email
    res.createNotification(obj1, function(code){ // create Notification callback
        if(code){
            msg(wialon.core.Errors.getErrorText(code)); 
            msg("error creation WATCH notification");
            return;
        }
        console.log("creation UBER notification"); // print create succeed message
    }); //Опции уведомлений без Email
    
        // construct Notifiacation object UBER Низкий заряд баранеи
    if (document.getElementById('no_email').checked ==false) {
        var obj2 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: Y Низкий заряд батареи. Значение = %PARAM_VALUE%.",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "S: Низкий заряд батареи", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"msg_param", p: { text_mask: "b", param: "b", type: "0", kind: 0, lower_bound:1, upper_bound:20}}
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true) {
        var obj2 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: Y Низкий заряд батареи. Значение = %PARAM_VALUE%.",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "S: Низкий заряд батареи", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"msg_param", p: { text_mask: "b", param: "data_state", type: "1", kind: 1}}
        };
    }//Опции уведомлений без Email
    res.createNotification(obj2, function(code){ // create Notification callback
        if(code){
            msg(wialon.core.Errors.getErrorText(code)); 
            msg("error Notification Сработка: Датчики взлома created CMA");
            return;
        } // exit if error code
        console.log("Notification S: Низкий заряд баранеи");
    });//Опции уведомлений без Email
    
    msg("S: 1 уведомлений создано");
}//Создаем уведомления для UBER

function createNotification_C(){
    console.log("start creation CP notification");
    var res = wialon.core.Session.getInstance().getItem($("#res").val()); //Загружаем данные выбраного из списка ресурс1
    if(!res){
        msg("Выбери ресурс");
        return; 
    }; //Проверянм: Ресурс выбран?
    var un = $("#units").val(); //Загружаем данные выбраного из списка объекта
    if(!un){
        msg("Select units"); 
        return; 
    } //Проверянм: объект выбран?
    var id_usr=$("#users").val();
    
    if (document.getElementById('no_email').checked ==false) {
        var first_email = $("#first_email").val();
        if(!first_email){
            msg("Не заполнено поле Email");
            return; };//Проверка: поле Email Заполнено?
        var sec_email = $("#sec_email").val();
        if(!sec_email){
            sec_email = first_email;
        };
        var tri_email = $("#sec_email").val();
        if(!tri_email){ 
            tri_email = first_email;
        }; 
    } //отключение поле Email 
    wialon.core.Session.getInstance().loadLibrary("mobileApps");
    var app = "{\"Wialon Local\""+":"+"["+id_usr+"]"+"}";//Выбор пользователя для мобильных уведомлений

    // construct Notifiacation object ТРЕВОЖНАЯ КНОПКА
    if (document.getElementById('no_email').checked ==false) {
        var obj1 = { ma:0, fl:1, tz:7200, la:"ru", 
                act: [  {t:"message", p:{color: "#ff0000"}}, 
                        {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                        {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                        {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                        {t:"event", p:{flags: 0}},
                        {"t":"mobile_apps","p":{"apps":app}}
                    ], // default values
                sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
                txt: "%UNIT%: НАЖАТА ТРЕВОЖНАЯ КНОПКА. Объект в %POS_TIME% двигался со скоростью %SPEED% около '%LOCATION%'.",
                mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
                n: "ТРЕВОЖНАЯ КНОПКА", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
                trg: {t:"alarm", p: {}}
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true) {
        var obj1 = { ma:0, fl:1, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: "#ff0000"}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: НАЖАТА ТРЕВОЖНАЯ КНОПКА. Объект в %POS_TIME% двигался со скоростью %SPEED% около '%LOCATION%'.",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "ТРЕВОЖНАЯ КНОПКА", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"alarm", p: {}}
        };
    }//Опции уведомлений без Email
    res.createNotification(obj1, function(code){ // create Notification callback
        if(code){
            msg(wialon.core.Errors.getErrorText(code)); 
            msg("error creation WATCH notification");
            return;
        }
        console.log("creation WATCH notification"); // print create succeed message
    }); //Опции уведомлений без Email

    // construct Notifiacation object Сработка сигнализации
    if (document.getElementById('no_email').checked ==false){
        var obj3 = { ma:0, fl:1, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: сработала сигнализация. Объект в %POS_TIME% двигался со скоростью %SPEED% около '%LOCATION%'. Дата и время сообщения: %MSG_TIME%",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "Сработала сигнализация", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Сработка сигнализации", sensor_type: "digital", type: 0, upper_bound: "1"}}      
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true){
        var obj3 = { ma:0, fl:1, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "UNIT%: сработала сигнализация. Объект в %POS_TIME% двигался со скоростью %SPEED% около '%LOCATION%'. Дата и время сообщения: %MSG_TIME%",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "Сработала сигнализация", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Сработка сигнализации", sensor_type: "digital", type: 0, upper_bound: "1"}}      
        };
    }//Опции уведомлений без Email
    res.createNotification(obj3, function(code){ // create Notification callback
        if(code){ 
            msg(wialon.core.Errors.getErrorText(code));
            msg("error Notification Сработка сигнализации: зажигание created");
            return;
        }
        console.log("Notification Сработка сигнализации"); // print create succeed message
    });//Создаем уведомление

    // construct Notifiacation object Низкое напряжения АКБ
    if (document.getElementById('no_email').checked ==false){
        var obj4 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: низкое напряжение АКБ. Автомобиль находился около '%LOCATION%'.",
            mmtd: 0, cdt: 0, mast: 300, mpst: 0, cp: 0, // default values
            n: "Низкое напряжения АКБ", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 0, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Датчик напряжения", sensor_type: "voltage", type: 0, upper_bound: "11.08"}}      
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true){
        var obj4 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: ""}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: низкое напряжение АКБ. Автомобиль находился около '%LOCATION%'.",
            mmtd: 0, cdt: 0, mast: 300, mpst: 0, cp: 0, // default values
            n: "Низкое напряжения АКБ", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 0, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Датчик напряжения", sensor_type: "voltage", type: 0, upper_bound: "11.08"}}      
        };
    }//Опции уведомлений без Email
    res.createNotification(obj4, function(code){ // create Notification callback
        if(code){ 
            msg(wialon.core.Errors.getErrorText(code));
            msg("error Notification Низкое напряжения АКБ created");
            return;
        } // exit if error code
        console.log("Notification Низкое напряжения АКБ created"); // print create succeed message
    });//Создаем уведомление

    msg("Connect 3 уведомлений создано");
}//Создаем уведомления для Connect 

function createNotification_test(){
    console.log("start creation CP notification");
    var res = wialon.core.Session.getInstance().getItem($("#res").val()); //Загружаем данные выбраного из списка ресурс1
    if(!res){
        msg("Выбери ресурс");
        return; 
    }; //Проверянм: Ресурс выбран?
    var un = $("#units").val(); //Загружаем данные выбраного из списка объекта
    if(!un){
        msg("Select units"); 
        return; 
    } //Проверянм: объект выбран?
    var id_usr=$("#users").val();
    
    if (document.getElementById('no_email').checked ==false) {
        var first_email = $("#first_email").val();
        if(!first_email){
            msg("Не заполнено поле Email");
            return; };//Проверка: поле Email Заполнено?
        var sec_email = $("#sec_email").val();
        if(!sec_email){
            sec_email = first_email;
        };
        var tri_email = $("#sec_email").val();
        if(!tri_email){ 
            tri_email = first_email;
        }; 
    } //отключение поле Email 
    wialon.core.Session.getInstance().loadLibrary("mobileApps");
    var app = "{\"Wialon Local\""+":"+"["+id_usr+"]"+"}";//Выбор пользователя для мобильных уведомлений

//    // construct Notifiacation object ТРЕВОЖНАЯ КНОПКА
//    if (document.getElementById('no_email').checked ==false) {
//        var obj1 = { ma:0, fl:1, tz:7200, la:"ru", 
//                act: [  {t:"message", p:{color: "#ff0000"}}, 
//                        {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
//                        {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
//                        {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
//                        {t:"event", p:{flags: 0}},
//                        {"t":"mobile_apps","p":{"apps":app}}
//                    ], // default values
//                sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
//                txt: "%UNIT%: НАЖАТА ТРЕВОЖНАЯ КНОПКА. Объект в %POS_TIME% двигался со скоростью %SPEED% около '%LOCATION%'.",
//                mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
//                n: "ТРЕВОЖНАЯ КНОПКА", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
//                trg: {t:"alarm", p: {}}
//        };
//    }//Опции  уведомлений с Email
//    if (document.getElementById('no_email').checked ==true) {
//        var obj1 = { ma:0, fl:1, tz:7200, la:"ru", 
//            act: [  {t:"message", p:{color: "#ff0000"}}, 
//                    {t:"event", p:{flags: 0}},
//                    {"t":"mobile_apps","p":{"apps":app}}
//                ], // default values
//            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
//            txt: "%UNIT%: НАЖАТА ТРЕВОЖНАЯ КНОПКА. Объект в %POS_TIME% двигался со скоростью %SPEED% около '%LOCATION%'.",
//            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
//            n: "ТРЕВОЖНАЯ КНОПКА", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
//            trg: {t:"alarm", p: {}}
//        };
//    }//Опции уведомлений без Email
//    res.createNotification(obj1, function(code){ // create Notification callback
//        if(code){
//            msg(wialon.core.Errors.getErrorText(code)); 
//            msg("error creation WATCH notification");
//            return;
//        }
//        console.log("creation WATCH notification"); // print create succeed message
//    }); //Опции уведомлений без Email
    
        // construct Notifiacation object ТРЕВОЖНАЯ КНОПКА
    if (document.getElementById('no_email').checked ==false){
        var obj1 = { 
            ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: "#ff0000"}}, 
                    {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: Test Время сработки: %MSG_TIME%. В %POS_TIME% объект двигался со скоростью %SPEED% около '%LOCATION%'.",
            mmtd: 0, cdt: 0, mast: 45, mpst: 0, cp: 0, // default values
            n: "Зажигание", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: { t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Зажигание", sensor_type: "", type: 0, upper_bound: "1"}}
        };
    }//Опции  уведомлений с Email
    if (document.getElementById('no_email').checked ==true){
        var obj1 = { ma:0, fl:1, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: "#ff0000"}},
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: НАЖАТА ТРЕВОЖНАЯ КНОПКА!!!!! Время сработки: %MSG_TIME%. В %POS_TIME% объект двигался со скоростью %SPEED% около '%LOCATION%'.",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "ТРЕВОЖНАЯ КНОПКА", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {t:"sensor_value", p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Тревожная кнопка", sensor_type: "digital", type: 0, upper_bound: "1"}}
        };
    }//Опции уведомлений без Email
    res.createNotification(obj1, function(code){ // create Notification callback
        if(code){
            msg(wialon.core.Errors.getErrorText(code)); 
            msg("error Notification ТРЕВОЖНАЯ КНОПКА created CP");
            return;
        }
        console.log("Notification ТРЕВОЖНАЯ КНОПКА created"); // print create succeed message
    }); //Создаем уведомление

    msg("Connect 1 уведомлений создано");
}//Создаем уведомления для Connect 

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
} //Задержка, не используется

function Update(){
    $("#res").html(''); 
    $("#res2").html('');
    $("#users").html('');
    $("#units").html('');
    init();
}//Обновление полей страницы согласно введенных данных

function select_product (){
    
    var prod_select = document.getElementsByName('prod');
    for(var i = 0; i < prod_select.length; i++){
        if(prod_select[i].checked){
            prod_value = prod_select[i].value;
        }
    }
//    if (prod_value=="CP"){
//        document.getElementById('div_but').id='create_btn_CP'   ;
//        document.getElementById('first_email').disabled=true;
//        document.getElementById('sec_email').disabled=false;
//        document.getElementById('tri_email').disabled=false;
//    }
//    else if (prod_value=="CMA"){
//        document.getElementById("div_but").id="create_btn_CMA";
//        document.getElementById('first_email').disabled=false;
//        document.getElementById('sec_email').disabled=true;
//        document.getElementById('tri_email').disabled=false;        
//    }
//    else if (prod_value=="CMM"){
//        document.getElementById("div_but").id="create_btn_CMM";
//        document.getElementById('first_email').disabled=false;
//        document.getElementById('sec_email').disabled=false;
//        document.getElementById('tri_email').disabled=true;        
//    }    
} //Не помню для чего, не используется нужно удалить!!!!

function getToken() {
    // construct login page URL
    var url = dns + "/login.html"; // your site DNS + "/login.html"
    url += "?client_id=" + "App";	// your application name
    url += "&access_type=" + -1;	// access level, 0x100 = "Online tracking only",
    url += "&activation_time=" + 0;	// activation time, 0 = immediately; you can pass any UNIX time value
    url += "&duration=" + 43200;	// duration, 604800 = one week in seconds, 1 chas
    url += "&flags=" + 0x1;			// options, 0x1 = add username in response
    
    url += "&redirect_uri=" + dns + "/post_token.html"; // if login succeed - redirect to this page

    // listen message with token from login page window
    window.addEventListener("message", tokenRecieved);
    
    // finally, open login page in new window
    window.open(url, "_blank", "width=760, height=500, top=300, left=500"); 
}// Main function

function tokenRecieved(e) {
    // get message from login window
    var msg1 = e.data;
    if (typeof msg1 == "string" && msg1.indexOf("access_token=") >= 0) {
        // get token
       	var token = msg1.replace("access_token=", "");
        // now we can use token, e.g show it on page
        //document.getElementById("token").innerHTML = token;
        document.getElementById("login").setAttribute("disabled", "");
        document.getElementById("logout").removeAttribute("disabled");
        // or login to wialon using our token
        wialon.core.Session.getInstance().initSession("http://navi.venbest.com.ua", null, 0x800);
        console.log("Token:" + token);
        msg("Успешный вход в систему");
        
        wialon.core.Session.getInstance().loginToken(token, "", function(code) {
            if (code)
                return;
//            var user = wialon.core.Session.getInstance().getCurrUser().getName();
//            alert("Authorized as " + user);
        });   
    }
}// Help function

function logout() {
    var sess = wialon.core.Session.getInstance();
	if (sess && sess.getId()) {
    	sess.logout(function() {
            document.getElementById("logout").setAttribute("disabled", "");
            document.getElementById("login").removeAttribute("disabled");
        });
    }
}

function button_work(){
    
    if(!prod_value){
        msg("Выбери продукт!");
        return; 
    };//Проверка: Продукт выбран?
    
    if (prod_value=="CP"){
        createNotification_CP();
        prod_value="";
        document.getElementById('CP').checked =false;
        document.getElementById('CMM').checked =false;
        document.getElementById('CMA').checked =false;
        document.getElementById('WATCH').checked =false;
        document.getElementById('UBER').checked =false;
        document.getElementById('C').checked =false;
        document.getElementById('test').checked =false;
        document.getElementById('CNTK').checked =false;
    }//Ели выбран СР, содаем его уведомления, и очищаем выбраный продукт
    else if (prod_value=="CMM"){
        createNotification_CMM();
        prod_value="";
        document.getElementById('CP').checked =false;
        document.getElementById('CMM').checked =false;
        document.getElementById('CMA').checked =false;
        document.getElementById('WATCH').checked =false;
        document.getElementById('UBER').checked =false;
        document.getElementById('C').checked =false;
        document.getElementById('test').checked =false;
        document.getElementById('CNTK').checked =false;
    }//Ели выбран СММ, содаем его уведомления, и очищаем выбраный продукт
    else if (prod_value=="CMA"){
        createNotification_CMA();
        prod_value="";
        document.getElementById('CP').checked =false;
        document.getElementById('CMM').checked =false;
        document.getElementById('CMA').checked =false;
        document.getElementById('WATCH').checked =false;
        document.getElementById('UBER').checked =false;
        document.getElementById('C').checked =false;
        document.getElementById('test').checked =false;
        document.getElementById('CNTK').checked =false;
    }//Ели выбран СМА, содаем его уведомления, и очищаем выбраный продукт
    else if (prod_value=="WATCH"){
        createNotification_WATCH();
        prod_value="";
        document.getElementById('CP').checked =false;
        document.getElementById('CMM').checked =false;
        document.getElementById('CMA').checked =false;
        document.getElementById('WATCH').checked =false;
        document.getElementById('UBER').checked =false;
        document.getElementById('C').checked =false;
        document.getElementById('test').checked =false;
        document.getElementById('CNTK').checked =false;
    }//Ели выбран WATCH, содаем его уведомления, и очищаем выбраный продукт
    else if (prod_value=="UBER"){
        createNotification_UBER();
        prod_value="";
        document.getElementById('CP').checked =false;
        document.getElementById('CMM').checked =false;
        document.getElementById('CMA').checked =false;
        document.getElementById('test').checked =false;
        document.getElementById('CNTK').checked =false;
        //document.getElementById('WATCH').checked =false;
        //document.getElementById('UBER').checked =false;
        //document.getElementById('C').checked =false;
    }//Ели выбран C, содаем его уведомления, и очищаем выбраный продукт
    else if (prod_value=="C"){
        createNotification_C();
        prod_value="";
        document.getElementById('CP').checked =false;
        document.getElementById('CMM').checked =false;
        document.getElementById('CMA').checked =false;
        document.getElementById('WATCH').checked =false;
        document.getElementById('UBER').checked =false;
        document.getElementById('C').checked =false;
        document.getElementById('test').checked =false;
        document.getElementById('CNTK').checked =false;
    }//Ели выбран C, содаем его уведомления, и очищаем выбраный продукт
    else if (prod_value=="test"){
        createNotification_test();
        prod_value="";
        document.getElementById('CP').checked =false;
        document.getElementById('CMM').checked =false;
        document.getElementById('CMA').checked =false;
        document.getElementById('WATCH').checked =false;
        document.getElementById('UBER').checked =false;
        document.getElementById('C').checked =false;
        document.getElementById('test').checked =false;
        document.getElementById('CNTK').checked =false;
    }//Ели выбран test, содаем его уведомления, и очищаем выбраный продукт
    else if (prod_value=="CNTK"){
        createNotification_CNTK();
        prod_value="";
        document.getElementById('CP').checked =false;
        document.getElementById('CMM').checked =false;
        document.getElementById('CMA').checked =false;
        document.getElementById('WATCH').checked =false;
        document.getElementById('UBER').checked =false;
        document.getElementById('C').checked =false;
        document.getElementById('test').checked =false;
        document.getElementById('CNTK').checked =false;
    }//Ели выбран СММ, содаем его уведомления, и очищаем выбраный продукт
    
}//Выбор продукта и создание уведомлений для него

function password_generator(  ) {
    if(!$("#username").val()){
        msg("Введите имя пользователя");
        return; 
    }
    var length = (5)?(5):(10);
    var string = "abcdefghijklmnopqrstuvwxyz"; //to upper 
    var numeric = '0123456789';
    var punctuation = '';
    var password = "";
    var character = "";
    var crunch = true;
    while( password.length<length ) {
        entity1 = Math.ceil(string.length * Math.random()*Math.random());
        entity2 = Math.ceil(numeric.length * Math.random()*Math.random());
        entity3 = Math.ceil(punctuation.length * Math.random()*Math.random());
        hold = string.charAt( entity1 );
        hold = (entity1%2==0)?(hold.toUpperCase()):(hold);
        character += hold;
        character += numeric.charAt( entity2 );
        character += punctuation.charAt( entity3 );
        password = character;
        //msg (password);
    } 
    console.log (password);
    document.getElementById('passw').value = password;
    out = "Login: "+ $("#username").val() + "\r\n" + "Pass: " + password + "\r\n";
    document.getElementById('Out').value = out;
}//Генератор паролей

function no_email_check(){
    if (document.getElementById('no_email').checked ==true){
        document.getElementById('first_email').disabled =true;
        document.getElementById('sec_email').disabled =true;
        document.getElementById('tri_email').disabled =true;
    }//Уведомления без почтового ящика
    if (document.getElementById('no_email').checked ==false){
        document.getElementById('first_email').disabled =false;
        document.getElementById('sec_email').disabled =false;
        document.getElementById('tri_email').disabled =false;
    }
} //Если отмечено без email содаем другие уведомления без email   

$(document).ready(function () {
       // bind actions to button clicks
	$("#create_btn").click( button_work); // bind action to button click
        $("#Set_access").click( set_access );
        //$("#create_user").click (Locale); 
        $("#create_user").click (createuser);
        $("#Update").click (Update); 
        $("#Update_1").click (Update); 
        $("#Generate").click( password_generator);
        $("#no_email").click( no_email_check);
        $("#Locale").click(Locale);
//loop1: for (var a = 0; a < 10000000; a++) {
//   if (a == 100000000) {
//       break loop1; // Только 4 попытки
//   }}
//         msg("2");
}); //Запускаем функции после загрузки станицы