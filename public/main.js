// Print message to log
function msg(text){
    $("#log").prepend(text + "<br/>"); }

var searchBox = document.querySelector("#searchBox");
var prod_value;// переменная для вібора уведомлений по продукту
// Wialon site dns
var dns = "http://navi.venbest.com.ua";
var token;
var pass_out;
var out;

function init() { // Execute after login succeed
	var sess = wialon.core.Session.getInstance(); // get instance of current Session
    //specify what kind of data should be returned (diffrent flags for 'avl_unit' and 'avl_resource')
        var flags_res =  wialon.item.Item.dataFlag.base | wialon.item.Item.accessFlag.setItemsAccess | wialon.item.Item.accessFlag.setAcl;
        var user_flags = wialon.item.Item.dataFlag.base | wialon.item.User.dataFlag.flags | wialon.item.Item.dataFlag.CustomProps; 
        var flags_units = wialon.item.Item.dataFlag.base | wialon.item.Unit.dataFlag.restricted;
        var mappss=0x00000800;
        var $username = $("#username").val(); // имя нового юзера из формы
        var $searchBox = $("#searchBox").val();
	
	sess.loadLibrary("resourceNotifications"); // load Notification Library 
	sess.updateDataFlags( // load items to current session
		[{type: "type", data: "avl_resource", flags: flags_res, mode: 0}, // Items (avl_resource) specification
		{type: "type", data: "avl_unit", flags: flags_units, mode: 0}, // Items (avl_unit) specification
                {type: "type", data: "user", flags: user_flags, mode: 0}, // Items (avl_unit) specification
                {type: "type", data: "mapps", flags: mappss, mode: 0}], // Items (avl_unit) specification
		function (code) { // updateDataFlags callback
			if (code) { msg(wialon.core.Errors.getErrorText(code)+", ммм, как на счет залогинится?"); return; }
                        
// get loaded 'avl_resource's items with edit notification access 
			var res = wialon.util.Helper.filterItems(sess.getItems("avl_resource"),
                        wialon.item.Resource.accessFlag.editNotifications);
// construct Select list using found resources "name"
                        for (var i = 0; i< res.length; i++) 
                            $("#res").append("<option value='"+ res[i].getId() +"'>"+ res[i].getName() +"</option>");
                            $("#res :contains('_user')option").remove();
                            $("#res :not(:contains("+$username+"))option").remove();
                            $("#res :contains("+$username+")").attr("selected", "selected");
// construct Select list using found resources "name_user"
                        for (var i = 0; i< res.length; i++)
                            $("#res2").append("<option value='"+ res[i].getId() +"'>"+ res[i].getName() +"</option>");
                            $("#res2 :not(:contains('_user'))option").remove();
                            $("#res2 :not(:contains("+$username+"))option").remove();
                            $("#res2 :contains('_user')").attr("selected", "selected");
// get loaded 'avl_unit's items
                        var units = sess.getItems("avl_unit");
// construct Select list using found units
			for (var i = 0; i< units.length; i++) 
                            $("#units").append("<option value='"+ units[i].getId() +"'>"+ units[i].getUniqueId()+ " (" + units[i].getName() + ")" +"</option>");
                            $("#units :not(:contains("+$searchBox+"))option").remove();
// get loaded 'users's items                       
                        var users = sess.getItems("user"); 
// construct Select list using found users                        
			for (var i = 0; i< users.length; i++) 
                            $("#users").append("<option value='"+ users[i].getId() +"'>"+ users[i].getName() +"</option>");
                            $("#users :not(:contains("+$username+"))option").remove();
                            $("#users :contains("+$username+")").attr("selected", "selected");
	});    
}

function createuser(){
    var user = wialon.core.Session.getInstance().getCurrUser();
    var username = $("#username").val(); // имя нового юзера из формы
    if(!username){ msg("Введите имя пользователя"); return; } // если не введено имя, возвращаем
    var passw = $("#passw").val(); // пароль для нового юзера из формы
    if(!passw){ msg("Введите пароль"); return; } // eесли не введен пароль, возвращаем
    var flag = 1; //флаг
    var skipCreatorCheck = 1; //флаг
    wialon.core.Session.getInstance().createUser(user, username, passw, flag, function(code, obj) { //create username
        if (code != 0){ msg(wialon.core.Errors.getErrorText(code)+", ммм, как на счет залогинится?"); return ; }
        var newuser = obj;


        console.log("User created: '" + username + "'"); //выводим в лог созданного пользователя
        wialon.core.Session.getInstance().createResource(newuser, username, flag, skipCreatorCheck, function(code, obj1) { //create resurce 1
            if (code != 0){ alert(wialon.core.Errors.getErrorText(code)); return; }
            console.log("Resources 1 created: '" + username + "'"); //выводим в лог созданный ресурс1
            wialon.core.Session.getInstance().createResource(newuser, username + "_user", flag, skipCreatorCheck, function(code, obj2) { //create resurce 2
                if (code != 0){ alert(wialon.core.Errors.getErrorText(code)); return; } 
                console.log("Resources 2 created: '" + username + "_user'"); //выводим в лог созданный ресурс2   
                msg("Создано пользователя и два ресурса");
            });
        });
    });
}

function set_access(){
    var sess = wialon.core.Session.getInstance();
    var flag_res=4648339329; // Access flag for res 550594678661
    var flag_res_user=52785134440321;
    var flag_unit=550594678661;
    var flag_usr = 0; // Access flag for usr
    var mask_flag_usr = 23; // mask of flag;
//    var locale_flag = -134155792;//184753184;
    
    var unit=$("#units").val(); //check for select resource
    if(!unit)
    {
        msg("Выберите Объект"); 
        return; // exit if no resource select
    } 

    var res=$("#res").val(); //check for select resource
    if(!res)
    { 
        msg("Выберите ресурс"); 
        return; // exit if no resource select
    }   
    var res2=$("#res2").val(); //check for select resource
    if(!res2)
    { 
        msg("Выберите ресурс2"); 
        return; // exit if no resource select
    }
    var id_usr=$("#users").val(); //check for select user
    if(!id_usr)
    {
        msg("Выберите User"); 
        return; // exit if no user select
    }  
    var userr = sess.getItem( id_usr );    
    userr.updateItemAccess(sess.getItem( res ), flag_res, function(code) // set accsess to item
    {
        if (code != 0)
        {
            alert(wialon.core.Errors.getErrorText(code));
            return;
        }
        console.log("access to res Done");
    });
    
     var userr = sess.getItem( id_usr );    
    userr.updateItemAccess(sess.getItem( res2 ), flag_res_user, function(code) // set accsess to item
    {
        if (code != 0)
        {
            alert(wialon.core.Errors.getErrorText(code));
            return;
        }
        console.log("access to res_user Done");
    });
    
    userr.updateUserFlags(flag_usr, mask_flag_usr, function(code) // set accsess to user
    {
        if (code != 0)
        {
            alert(wialon.core.Errors.getErrorText(code));
            return;
        }
        console.log("access to User Done :");
    });
    var userr = sess.getItem( id_usr );    
    userr.updateItemAccess(sess.getItem( unit ), flag_unit, function(code) // set accsess to item
    {
        if (code != 0)
        {
            alert(wialon.core.Errors.getErrorText(code));
            return;
        }
        console.log("access to unit Done");
    });
    msg("Установлены права для пользователя, объекта и двум ресурам")
}   

function Locale(){
    
        var id_usr=$("#users").val(); //check for select user
    if(!id_usr)
    {
        msg("Выберите User"); 
        return; // exit if no user select
    } 
    var sess = wialon.core.Session.getInstance();
    var user = sess.getItem( id_usr );
    var locale = {};
    locale.formatDate = "%Y-%m-%E %H:%M:%S";
    locale.flags = 0;
    var localeflag = -134155792;
    user.getRenderer().setLocale(localeflag, "ru", locale, null);
    msg("done");
    
//        wialon.core.Session.getInstance().getRenderer().setLocale(locale_flag, "ru", {flags:0,formatDate:'%Y/%m/%E %H:%M:%S'}, function(code) // set locale to user
//    {
//        if (code != '' )
//        {
//            lert(wialon.core.Errors.getErrorText(code));
//            return;
//        }
//        msg("locale to User Done :" + code);
//    });
}

function createNotification_CP(){ //create notification
    console.log("start creation CP notification");
    var res = wialon.core.Session.getInstance().getItem($("#res").val()); //get resource by id
    if(!res){ msg("Выбери ресурс"); return; }; // check if resource found
    var un = $("#units").val(); // get selected units ids
    wialon.core.Session.getInstance().loadLibrary("mobileApps"); 

    var id_usr=$("#users").val();
    if (document.getElementById('no_email').checked ==false) {
        var first_email = $("#first_email").val();
        if(!first_email){ msg("Email то забыл ввеси, а?"); return; };
        var sec_email = $("#sec_email").val();
        if(!sec_email){ sec_email = first_email;};
        var tri_email = $("#sec_email").val();
        if(!tri_email){ tri_email = first_email;}; 
    }
    
    var app = "{\"Wialon Local\""+":"+"["+id_usr+"]"+"}";

    // simple validation and exit if invalid
    if(!un)
    {
        msg("Select units"); 
        return; 
    } // units validation
    // construct Notifiacation object ТРЕВОЖНАЯ КНОПКА
    if (document.getElementById('no_email').checked ==false) 
    {
        var obj1 = { ma:0, fl:1, tz:7200, la:"ru", 
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
                trg: {// Notification trigger
                    t:"sensor_value", // geofences control
                    p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Тревожная кнопка", sensor_type: "digital", type: 0, upper_bound: "1"}
                }
            };
    }
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
            trg: {// Notification trigger
                t:"sensor_value", // geofences control
                p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Тревожная кнопка", sensor_type: "digital", type: 0, upper_bound: "1"}
            }
        };
    }
        res.createNotification(obj1, // create Notification using created object
        function(code){ // create Notification callback
                if(code)
                {
                    msg(wialon.core.Errors.getErrorText(code)); 
                    msg("error Notification ТРЕВОЖНАЯ КНОПКА created CP");
                    return;
                }
                console.log("Notification ТРЕВОЖНАЯ КНОПКА created"); // print create succeed message
        }); 

    // construct Notifiacation object Сработка: Датчики взлома
    if (document.getElementById('no_email').checked ==false){
        var obj2 = { ma:0, fl:0, tz:7200, la:"ru", 
                act: [  {t:"message", p:{color: "black"}}, 
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
                trg: {// Notification trigger
                    t:"sensor_value", // geofences control
                    p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Сработка сигнализации: двери", sensor_type: "digital", type: 0, upper_bound: "1"}// trigger parameters ( geozones ids, control type)
                }      
        };
    }
    if (document.getElementById('no_email').checked ==true)
    {
        var obj2 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: "black"}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
            sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
                txt: "%UNIT%: Несанкционированное открытие дверей, капота или багажника. Время сработки: %MSG_TIME%. Автомобиль находился около '%LOCATION%'.",
                mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
                n: "Сработка: Датчики взлома", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {// Notification trigger
                t:"sensor_value", // geofences control
            p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Сработка сигнализации: двери", sensor_type: "digital", type: 0, upper_bound: "1"}// trigger parameters ( geozones ids, control type)
            }      
        };
    }
    res.createNotification(obj2, // create Notification using created object
        function(code){ // create Notification callback
                if(code)
                {
                    msg(wialon.core.Errors.getErrorText(code)); 
                    msg("error Notification Сработка: Датчики взлома created");
                    return;
                } // exit if error code
                console.log("Notification Сработка: Датчики взлома created");
        //msg("Notification Сработка: Датчики взлома created"); // print create succeed message
    });

            // construct Notifiacation object Сработка сигнализации: зажигание
    if (document.getElementById('no_email').checked ==false)
    {
    var obj3 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: "black"}}, 
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
            trg: {// Notification trigger
                t:"sensor_value", // geofences control
                p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Сработка сигнализации: зажигание", sensor_type: "digital", type: 0, upper_bound: "1"}// trigger parameters ( geozones ids, control type)
            }      
        };
    }
    if (document.getElementById('no_email').checked ==true)
    {
    var obj3 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: "black"}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
        sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: Несанкционированное включение зажигания. Время сработки: %MSG_TIME%. Автомобиль находился около '%LOCATION%'.",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "Сработка: Включено зажигание", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {// Notification trigger
                t:"sensor_value", // geofences control
                p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Сработка сигнализации: зажигание", sensor_type: "digital", type: 0, upper_bound: "1"}// trigger parameters ( geozones ids, control type)
            }      
        };
    }
    
    res.createNotification(obj3, // create Notification using created object
        function(code){ // create Notification callback
                if(code)
                { 
                    msg(wialon.core.Errors.getErrorText(code));
                    msg("error Notification Сработка сигнализации: зажигание created");
                    return;
                }
                console.log("Notification Сработка сигнализации: зажигание created"); // print create succeed message
    });

                    // construct Notifiacation object Низкое напряжения АКБ
    if (document.getElementById('no_email').checked ==false)
    {
    var obj4 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: "black"}}, 
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
            trg: {// Notification trigger
                t:"sensor_value", // geofences control
                p: {lower_bound: 0, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Напряжение АКБ", sensor_type: "voltage", type: 0, upper_bound: "11.08"}// trigger parameters ( geozones ids, control type)
            }      
        };
    }
    if (document.getElementById('no_email').checked ==true)
    {
    var obj4 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: "black"}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
        sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: низкое напряжение АКБ. Автомобиль находился около '%LOCATION%'.",
            mmtd: 0, cdt: 0, mast: 300, mpst: 0, cp: 0, // default values
            n: "Низкое напряжения АКБ", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {// Notification trigger
                t:"sensor_value", // geofences control
                p: {lower_bound: 0, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Напряжение АКБ", sensor_type: "voltage", type: 0, upper_bound: "11.08"}// trigger parameters ( geozones ids, control type)
            }      
        };
    }
    res.createNotification(obj4, // create Notification using created object
        function(code){ // create Notification callback
                if(code)
                { 
                    msg(wialon.core.Errors.getErrorText(code));
                    msg("error Notification Низкое напряжения АКБ created");
                    return;
                } // exit if error code
                    console.log("Notification Низкое напряжения АКБ created"); // print create succeed message
    });

    // construct Notifiacation object НЕ ЗАКРЫТЫ ДВЕРИ/КАПОТ/БАГАЖНИК В ОХРАНЕ
    if (document.getElementById('no_email').checked ==false)
    {
    var obj5 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: "black"}}, 
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
            trg: {// Notification trigger
                t:"sensor_value", // geofences control
                p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Не закрыты двери в охране", sensor_type: "digital", type: 0, upper_bound: "1"}// trigger parameters ( geozones ids, control type)
            }      
        };
    }
    if (document.getElementById('no_email').checked ==true)
    {
    var obj5 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: "black"}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
        sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: БЫЛИ НЕ ЗАКРЫТЫ ДВЕРИ/КАПОТ ИЛИ БАГАЖНИК ПРИ ПОСТАНОВКЕ НА ОХРАНУ. %POS_TIME% он двигался со скоростью %SPEED% около '%LOCATION%'.",
            mmtd: 0, cdt: 0, mast: 30, mpst: 0, cp: 0, // default values
            n: "НЕ ЗАКРЫТЫ ДВЕРИ/КАПОТ/БАГАЖНИК В ОХРАНЕ", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {// Notification trigger
                t:"sensor_value", // geofences control
                p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Не закрыты двери в охране", sensor_type: "digital", type: 0, upper_bound: "1"}// trigger parameters ( geozones ids, control type)
            }      
        };
    }
    res.createNotification(obj5, // create Notification using created object
        function(code){ // create Notification callback
                if(code)
                {
                   msg(wialon.core.Errors.getErrorText(code));
                   msg("error Notification НЕ ЗАКРЫТЫ ДВЕРИ/КАПОТ/БАГАЖНИК В ОХРАНЕ created");
                   return;
               } // exit if error code
                   console.log("Notification НЕ ЗАКРЫТЫ ДВЕРИ/КАПОТ/БАГАЖНИК В ОХРАНЕ created"); // print create succeed message
    });

  // construct Notifiacation object Блокировка двигателя
    if (document.getElementById('no_email').checked ==false)
    {
    var obj6 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: "black"}}, 
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
            trg: {// Notification trigger
                t:"sensor_value", // geofences control
                p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Блокировка иммобилайзера", sensor_type: "digital", type: 0, upper_bound: "1"}// trigger parameters ( geozones ids, control type)
            }      
        };
    }
    if (document.getElementById('no_email').checked ==true)
    {
    var obj6 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: "black"}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
        sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: Произошла блокировка двигателя. Время сработки: %MSG_TIME%  В %POS_TIME% автомобиль двигался со скоростью %SPEED% около '%LOCATION%'.",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "Блокировка двигателя", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {// Notification trigger
                t:"sensor_value", // geofences control
                p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Блокировка иммобилайзера", sensor_type: "digital", type: 0, upper_bound: "1"}// trigger parameters ( geozones ids, control type)
            }      
        };
    }
    res.createNotification(obj6, // create Notification using created object
        function(code){ // create Notification callback
                if(code)
                { 
                    msg(wialon.core.Errors.getErrorText(code));
                    msg("error Notification Блокировка двигателя created");
                    return;
                } // exit if error code
                    console.log("Notification Блокировка двигателя created"); // print create succeed message
    });

          // construct Notifiacation object Cработка: Датчик удара/наклона/буксировки
    if (document.getElementById('no_email').checked ==false)
    {
    var obj7 = { ma:0, fl:0, tz:7200, la:"ru", mpst:60,
            act: [  {t:"message", p:{color: "black"}}, 
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
            trg: {// Notification trigger
                t:"sensor_value", // geofences control
                p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Датчик удара", sensor_type: "digital", type: 0, upper_bound: "1"}// trigger parameters ( geozones ids, control type)
            }      
        };
    }
    if (document.getElementById('no_email').checked ==true)
    {
    var obj7 = { ma:0, fl:0, tz:7200, la:"ru", mpst:60,
            act: [  {t:"message", p:{color: "black"}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
        sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: сработал датчик удара/наклона/буксировки. Время сработки: %MSG_TIME%. В %POS_TIME% автомобиль находился около '%LOCATION%'.",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "Cработка: Датчик удара/наклона/буксировки", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {// Notification trigger
                t:"sensor_value", // geofences control
                p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "Датчик удара", sensor_type: "digital", type: 0, upper_bound: "1"}// trigger parameters ( geozones ids, control type)
            }      
        };
    }
    res.createNotification(obj7, // create Notification using created object
        function(code){ // create Notification callback
                if(code)
                { 
                    msg(wialon.core.Errors.getErrorText(code));
                    msg("error Notification Cработка: Датчик удара/наклона/буксировки created");
                    return;
                } // exit if error code
                console.log("Notification Cработка: Датчик удара/наклона/буксировки created"); // print create succeed message
    });

          // construct Notifiacation object Cработка: ГЛУШЕНИЕ GSM (ДВИЖЕНИЕ)        
    if (document.getElementById('no_email').checked ==false)
    {
    var obj8 = { ma:0, fl:0, tz:7200, la:"ru",  mpst:60,
            act: [  {t:"message", p:{color: "black"}}, 
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
            trg: {// Notification trigger
                t:"sensor_value", // geofences control
                p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "ГЛУШЕНИЕ GSM (ДВИЖЕНИЕ)", sensor_type: "digital", type: 0, upper_bound: "1"}// trigger parameters ( geozones ids, control type)
            }      
        };
    }
        if (document.getElementById('no_email').checked ==true)
    {
    var obj8 = { ma:0, fl:0, tz:7200, la:"ru",  mpst:60,
            act: [  {t:"message", p:{color: "black"}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
        sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: Глушение  сигнала Дата и время сообщения: %MSG_TIME%",
            mmtd: 0, cdt: 0, mast: 0, mpst: 60, cp: 0, // default values
            n: "ГЛУШЕНИЕ GSM (ДВИЖЕНИЕ)", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {// Notification trigger
                t:"sensor_value", // geofences control
                p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "ГЛУШЕНИЕ GSM (ДВИЖЕНИЕ)", sensor_type: "digital", type: 0, upper_bound: "1"}// trigger parameters ( geozones ids, control type)
            }      
        };
    }
    res.createNotification(obj8, // create Notification using created object
        function(code){ // create Notification callback
                if(code)
                { 
                    msg(wialon.core.Errors.getErrorText(code));
                    msg("error Notification ГЛУШЕНИЕ GSM (ДВИЖЕНИЕ)");
                    return;
                } // exit if error code
                console.log("Notification ГЛУШЕНИЕ GSM (ДВИЖЕНИЕ)"); // print create succeed message
    });


          // construct Notifiacation object ГЛУШЕНИЕ GSM (ПАРКИНГ)        
    if (document.getElementById('no_email').checked ==false)
    {
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
            trg: {// Notification trigger
                t:"sensor_value", // geofences control
                p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "ГЛУШЕНИЕ GSM (ПАРКИНГ)", sensor_type: "digital", type: 0, upper_bound: "1"}// trigger parameters ( geozones ids, control type)
            }      
        };
    }
    if (document.getElementById('no_email').checked ==true)
    {
    var obj9 = { ma:0, fl:0, tz:7200, la:"ru",
            act: [  {t:"message", p:{color: "2"}}, 
                    {t:"event", p:{flags: 0}},
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
        sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: Глушение  сигнала В %POS_TIME% объект двигался со скоростью %SPEED% около '%LOCATION%'. Дата и время сообщения: %MSG_TIME%",
            mmtd: 0, cdt: 0, mast: 0, mpst: 60, cp: 0, // default values
            n: "ГЛУШЕНИЕ GSM (ПАРКИНГ)", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {// Notification trigger
                t:"sensor_value", // geofences control
                p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "ГЛУШЕНИЕ GSM (ПАРКИНГ)", sensor_type: "digital", type: 0, upper_bound: "1"}// trigger parameters ( geozones ids, control type)
            }      
        };
    }
    res.createNotification(obj9, // create Notification using created object
        function(code){ // create Notification callback
                if(code)
                { 
                    msg(wialon.core.Errors.getErrorText(code));
                    msg("error Notification ГЛУШЕНИЕ GSM (ПАРКИНГ)");
                    return;
                } // exit if error code
                console.log("Notification ГЛУШЕНИЕ GSM (ПАРКИНГ)"); // print create succeed message
    });

    msg("9 уведомлений создано");
}

function createNotification_CMM(){ //create notification
    console.log("start creation CMM notification");
    var res = wialon.core.Session.getInstance().getItem($("#res").val()); //get resource by id
    if(!res){ msg("Выбери ресурс"); return; }; // check if resource found
    var un = $("#units").val(); // get selected units ids
    wialon.core.Session.getInstance().loadLibrary("mobileApps"); 

    var id_usr=$("#users").val();
    var first_email = $("#first_email").val();
    if(!first_email){ msg("Email то забыл ввеси, а?"); return; };
    var sec_email = $("#sec_email").val();
    if(!sec_email){ sec_email = first_email;};
    var tri_email = $("#sec_email").val();
    if(!tri_email){ tri_email = first_email;}; 
    var app = "{\"Wialon Local\""+":"+"["+id_usr+"]"+"}";

    // simple validation and exit if invalid
    if(!un){ msg("Select units"); return; } // units validation
    // construct Notifiacation object ТРЕВОЖНАЯ КНОПКА
    var obj1 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: "#ff0000"}}, 
                    {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                    {t:"event", p:{flags: 0}},
//                        {"t":"mobile_apps","p":{"apps":"{\"Wialon Local\":[id_usr]}"}}
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
        sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: %MSG_TIME% Нажата тревожная кнопка",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "СММ: Тревожная кнопка (B)", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {// Notification trigger
                t:"sensor_value", 
                p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Тревожная кнопка", sensor_type: "any", type: 0, upper_bound: "1"}// trigger parameters ( geozones ids, control type)
            }
    };

        res.createNotification(obj1, // create Notification using created object
        function(code){ // create Notification callback
                if(code)
                {
                    msg(wialon.core.Errors.getErrorText(code)); 
                    msg("error Notification ТРЕВОЖНАЯ КНОПКА created CMM");
                    return;
                }
                console.log("Notification ТРЕВОЖНАЯ КНОПКА created CMM"); // print create succeed message
        }); 

    // construct Notifiacation object Сработка: Датчики взлома
    var obj2 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: "black"}}, 
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
            trg: {// Notification trigger
                t:"sensor_value", // geofences control
                p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Датчик взлома", sensor_type: "any", type: 0, upper_bound: "1"}// trigger parameters ( geozones ids, control type)
            }      
    };
    res.createNotification(obj2, // create Notification using created object
        function(code){ // create Notification callback
                if(code)
                {
                    msg(wialon.core.Errors.getErrorText(code)); 
                    msg("error Notification Сработка: Датчики взлома created CMM");
                    return;
                } // exit if error code
                console.log("Notification Сработка: Датчики взлома created CMM");
        //msg("Notification Сработка: Датчики взлома created"); // print create succeed message
    });

            // construct Notifiacation object Сработка сигнализации: зажигание
    var obj3 =  { ma:0, fl:1, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: "black"}}, 
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
            trg: {// Notification trigger
                t:"sensor_value", // geofences control
                p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Зажигание в охране", sensor_type: "any", type: 0, upper_bound: "1"}// trigger parameters ( geozones ids, control type)
            }      
    };
    res.createNotification(obj3, // create Notification using created object
        function(code){ // create Notification callback
                if(code)
                { 
                    msg(wialon.core.Errors.getErrorText(code));
                    msg("error Notification Сработка сигнализации: зажигание created CMM");
                    return;
                }
                console.log("Notification Сработка сигнализации: зажигание created CMM"); // print create succeed message
    });

                    // construct Notifiacation object Низкое напряжения АКБ
    var obj4 = { ma:0, fl:1, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: "black"}}, 
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
            trg: {// Notification trigger
                t:"sensor_value", // geofences control
                p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Аккумулятор разряжен", sensor_type: "any", type: 0, upper_bound: 1}// trigger parameters ( geozones ids, control type)
            }      
    };
    res.createNotification(obj4, // create Notification using created object
        function(code){ // create Notification callback
                if(code)
                { 
                    msg(wialon.core.Errors.getErrorText(code));
                    msg("error Notification Низкое напряжения АКБ created CMM");
                    return;
                } // exit if error code
                    console.log("Notification Низкое напряжения АКБ created CMM"); // print create succeed message
    });

    // construct Notifiacation object Основной аккумулятор отключен
    var obj5 = { ma:0, fl:1, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: "black"}}, 
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
            trg: {// Notification trigger
                t:"sensor_value", // geofences control
                p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Аккумулятор отключен", sensor_type: "any", type: 0, upper_bound: "1"}// trigger parameters ( geozones ids, control type)
            }      
    };
    res.createNotification(obj5, // create Notification using created object
        function(code){ // create Notification callback
                if(code)
                {
                   msg(wialon.core.Errors.getErrorText(code));
                   msg("error Notification Основной аккумулятор отключен created CMM");
                   return;
               } // exit if error code
                   console.log("Notification Основной аккумулятор отключен created CMM"); // print create succeed message
    });

  // construct Notifiacation object Блокировка двигателя
    var obj6 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: "black"}}, 
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
            trg: {// Notification trigger
                t:"msg_param", // geofences control
                p: {text_mask: "*b*", param: "data_state", type : "1", kind: 1}// trigger parameters ( geozones ids, control type)
            }      
    };
    res.createNotification(obj6, // create Notification using created object
        function(code){ // create Notification callback
                if(code)
                { 
                    msg(wialon.core.Errors.getErrorText(code));
                    msg("error Notification Блокировка двигателя created CMM");
                    return;
                } // exit if error code
                    console.log("Notification Блокировка двигателя created CMM"); // print create succeed message
    });

          // construct Notifiacation object Cработка: Датчик наклона
    var obj7 = { ma:0, fl:1, tz:7200, la:"ru", mpst:60,
            act: [  {t:"message", p:{color: "black"}}, 
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
            trg: {// Notification trigger
                t:"sensor_value", // geofences control
                p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Датчик наклона", sensor_type: "any", type: 0, upper_bound: "1"}// trigger parameters ( geozones ids, control type)
            }       
    };
    res.createNotification(obj7, // create Notification using created object
        function(code){ // create Notification callback
                if(code)
                { 
                    msg(wialon.core.Errors.getErrorText(code));
                    msg("error Notification Cработка: Датчик удара/наклона/буксировки created CMM");
                    return;
                } // exit if error code
                console.log("Notification Cработка: Датчик удара/наклона/буксировки created CMM"); // print create succeed message
    });

          // construct Notifiacation object Cработка: Датчик удара        
    var obj8 = { ma:0, fl:1, tz:7200, la:"ru",  mpst:60,
            act: [  {t:"message", p:{color: "black"}}, 
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
            trg: {// Notification trigger
                t:"sensor_value", // geofences control
                p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Датчик удара", sensor_type: "any", type: 0, upper_bound: "1"}// trigger parameters ( geozones ids, control type)
            }      
    };
    res.createNotification(obj8, // create Notification using created object
        function(code){ // create Notification callback
                if(code)
                { 
                    msg(wialon.core.Errors.getErrorText(code));
                    msg("error Notification Датчик удара CMM");
                    return;
                } // exit if error code
                console.log("Notification Датчик удара CMM"); // print create succeed message
    });


          // construct Notifiacation object Cработка: Сирена       
    var obj9 = { ma:0, fl:0, tz:7200, la:"ru",
            act: [  {t:"message", p:{color: "black"}}, 
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
            trg: {// Notification trigger
                t:"msg_param", // geofences control
                p: { text_mask: "*f*p*", param: "data_state", type: "1", kind: 1}// trigger parameters ( geozones ids, control type)
            }      
    };
    res.createNotification(obj9, // create Notification using created object
        function(code){ // create Notification callback
                if(code)
                { 
                    msg(wialon.core.Errors.getErrorText(code));
                    msg("error Notification Cработка: Сирена CMM");
                    return;
                } // exit if error code
                console.log("Notification Cработка: Сирена  CMM"); // print create succeed message
    });

    msg("9 уведомлений создано");
}

function createNotification_CMA(){ //create notification
    console.log("start creation CMM notification");
    var res = wialon.core.Session.getInstance().getItem($("#res").val()); //get resource by id
    if(!res){ msg("Выбери ресурс"); return; }; // check if resource found
    var un = $("#units").val(); // get selected units ids
    wialon.core.Session.getInstance().loadLibrary("mobileApps"); 

    var id_usr=$("#users").val();
    var first_email = $("#first_email").val();
    if(!first_email){ msg("Email то забыл ввеси, а?"); return; };
    var sec_email = $("#sec_email").val();
    if(!sec_email){ sec_email = first_email;};
    var tri_email = $("#sec_email").val();
    if(!tri_email){ tri_email = first_email;}; 
    var app = "{\"Wialon Local\""+":"+"["+id_usr+"]"+"}";

    // simple validation and exit if invalid
    if(!un){ msg("Select units"); return; } // units validation
    // construct Notifiacation object ТРЕВОЖНАЯ КНОПКА
    var obj1 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: "#ff0000"}}, 
                    {t:"email", p:{email_to: first_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: sec_email, html: 0, img_attach: 0, subj:""}},
                    {t:"email", p:{email_to: tri_email, html: 0, img_attach: 0, subj:""}},
                    {t:"event", p:{flags: 0}},
//                        {"t":"mobile_apps","p":{"apps":"{\"Wialon Local\":[id_usr]}"}}
                    {"t":"mobile_apps","p":{"apps":app}}
                ], // default values
        sch: { f1:0, f2: 0, t1: 0, t2: 0, m: 0, y: 0, w: 0}, // shedule default value
            txt: "%UNIT%: %MSG_TIME% Нажата тревожная кнопка",
            mmtd: 0, cdt: 0, mast: 0, mpst: 0, cp: 0, // default values
            n: "CMA: Нажата тревожная кнопка (B)", un: un, ta: 0, td: 0,  // set name, units, activation and deactivation time
            trg: {// Notification trigger
                t:"sensor_value", 
                p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Тревожная кнопка", sensor_type: "any", type: 0, upper_bound: "1"}// trigger parameters ( geozones ids, control type)
            }
    };

        res.createNotification(obj1, // create Notification using created object
        function(code){ // create Notification callback
                if(code)
                {
                    msg(wialon.core.Errors.getErrorText(code)); 
                    msg("error Notification ТРЕВОЖНАЯ КНОПКА created CMA");
                    return;
                }
                console.log("Notification ТРЕВОЖНАЯ КНОПКА created CMA"); // print create succeed message
        }); 

    // construct Notifiacation object Сработка: Датчики взлома
    var obj2 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: "black"}}, 
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
            trg: {// Notification trigger
                t:"sensor_value", // geofences control
                p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Датчик взлома", sensor_type: "any", type: 0, upper_bound: "1"}// trigger parameters ( geozones ids, control type)
            }      
    };
    res.createNotification(obj2, // create Notification using created object
        function(code){ // create Notification callback
                if(code)
                {
                    msg(wialon.core.Errors.getErrorText(code)); 
                    msg("error Notification Сработка: Датчики взлома created CMA");
                    return;
                } // exit if error code
                console.log("Notification Сработка: Датчики взлома created CMA");
        //msg("Notification Сработка: Датчики взлома created"); // print create succeed message
    });

            // construct Notifiacation object Сработка сигнализации: зажигание
    var obj3 =  { ma:0, fl:1, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: "black"}}, 
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
            trg: {// Notification trigger
                t:"sensor_value", // geofences control
                p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Зажигание в охране", sensor_type: "any", type: 0, upper_bound: "1"}// trigger parameters ( geozones ids, control type)
            }      
    };
    res.createNotification(obj3, // create Notification using created object
        function(code){ // create Notification callback
                if(code)
                { 
                    msg(wialon.core.Errors.getErrorText(code));
                    msg("error Notification Сработка сигнализации: зажигание created CMA");
                    return;
                }
                console.log("Notification Сработка сигнализации: зажигание created CMA"); // print create succeed message
    });

                    // construct Notifiacation object Низкое напряжения АКБ
    var obj4 = { ma:0, fl:1, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: "black"}}, 
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
            trg: {// Notification trigger
                t:"sensor_value", // geofences control
                p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Аккумулятор разряжен", sensor_type: "any", type: 0, upper_bound: 1}// trigger parameters ( geozones ids, control type)
            }      
    };
    res.createNotification(obj4, // create Notification using created object
        function(code){ // create Notification callback
                if(code)
                { 
                    msg(wialon.core.Errors.getErrorText(code));
                    msg("error Notification Низкое напряжения АКБ created CMA");
                    return;
                } // exit if error code
                    console.log("Notification Низкое напряжения АКБ created CMA"); // print create succeed message
    });

    // construct Notifiacation object Основной аккумулятор отключен
    var obj5 = { ma:0, fl:1, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: "black"}}, 
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
            trg: {// Notification trigger
                t:"sensor_value", // geofences control
                p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Аккумулятор отключен", sensor_type: "any", type: 0, upper_bound: "1"}// trigger parameters ( geozones ids, control type)
            }      
    };
    res.createNotification(obj5, // create Notification using created object
        function(code){ // create Notification callback
                if(code)
                {
                   msg(wialon.core.Errors.getErrorText(code));
                   msg("error Notification Основной аккумулятор отключен created CMA");
                   return;
               } // exit if error code
                   console.log("Notification Основной аккумулятор отключен created CMA"); // print create succeed message
    });

  // construct Notifiacation object Блокировка двигателя
    var obj6 = { ma:0, fl:0, tz:7200, la:"ru", 
            act: [  {t:"message", p:{color: "black"}}, 
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
            trg: {// Notification trigger
                t:"msg_param", // geofences control
                p: {text_mask: "*b*", param: "data_state", type : "1", kind: 1}// trigger parameters ( geozones ids, control type)
            }      
    };
    res.createNotification(obj6, // create Notification using created object
        function(code){ // create Notification callback
                if(code)
                { 
                    msg(wialon.core.Errors.getErrorText(code));
                    msg("error Notification Блокировка двигателя created CMA");
                    return;
                } // exit if error code
                    console.log("Notification Блокировка двигателя created CMA"); // print create succeed message
    });

          // construct Notifiacation object Cработка: Датчик наклона
    var obj7 = { ma:0, fl:1, tz:7200, la:"ru", mpst:60,
            act: [  {t:"message", p:{color: "black"}}, 
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
            trg: {// Notification trigger
                t:"sensor_value", // geofences control
                p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Датчик наклона", sensor_type: "any", type: 0, upper_bound: "1"}// trigger parameters ( geozones ids, control type)
            }       
    };
    res.createNotification(obj7, // create Notification using created object
        function(code){ // create Notification callback
                if(code)
                { 
                    msg(wialon.core.Errors.getErrorText(code));
                    msg("error Notification Cработка: Датчик удара/наклона/буксировки created CMA");
                    return;
                } // exit if error code
                console.log("Notification Cработка: Датчик удара/наклона/буксировки created CMA"); // print create succeed message
    });

          // construct Notifiacation object Cработка: Датчик удара        
    var obj8 = { ma:0, fl:1, tz:7200, la:"ru",  mpst:60,
            act: [  {t:"message", p:{color: "black"}}, 
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
            trg: {// Notification trigger
                t:"sensor_value", // geofences control
                p: {lower_bound: 1, merge: 1, prev_msg_diff: 0, sensor_name_mask: "*Датчик удара", sensor_type: "any", type: 0, upper_bound: "1"}// trigger parameters ( geozones ids, control type)
            }      
    };
    res.createNotification(obj8, // create Notification using created object
        function(code){ // create Notification callback
                if(code)
                { 
                    msg(wialon.core.Errors.getErrorText(code));
                    msg("error Notification Датчик удара CMA");
                    return;
                } // exit if error code
                console.log("Notification Датчик удара CMA"); // print create succeed message
    });


          // construct Notifiacation object Cработка: Сирена       
    var obj9 = { ma:0, fl:0, tz:7200, la:"ru",
            act: [  {t:"message", p:{color: "black"}}, 
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
            trg: {// Notification trigger
                t:"msg_param", // geofences control
                p: { text_mask: "*f*p*", param: "data_state", type: "1", kind: 1}// trigger parameters ( geozones ids, control type)
            }      
    };
    res.createNotification(obj9, // create Notification using created object
        function(code){ // create Notification callback
                if(code)
                { 
                    msg(wialon.core.Errors.getErrorText(code));
                    msg("error Notification Cработка: Сирена CMA");
                    return;
                } // exit if error code
                console.log("Notification Cработка: Сирена  CMA"); // print create succeed message
    });
    
              // construct Notifiacation object Cработка: Сирена       
    var obj10 = { ma:0, fl:0, tz:7200, la:"ru",
            act: [  {t:"message", p:{color: "black"}}, 
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
            trg: {// Notification trigger
                t:"msg_param", // geofences control
                p: { text_mask: "*id*o1*", param: "data_state", type: "1", kind: 1}// trigger parameters ( geozones ids, control type)
            }      
    };
    res.createNotification(obj10, // create Notification using created object
        function(code){ // create Notification callback
                if(code)
                { 
                    msg(wialon.core.Errors.getErrorText(code));
                    msg("error Notification Cработка: Установлено в охрану с открытыми дверьми CMA");
                    return;
                } // exit if error code
                console.log("Notification Cработка: Установлено в охрану с открытыми дверьми  CMA"); // print create succeed message
    });

    msg("10 уведомлений создано");
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function Update (){
    $("#res").html(''); 
    $("#res2").html('');
    $("#users").html('');
    $("#units").html('');
    init();
}

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
}

function init1() {
    var sess = wialon.core.Session.getInstance(); 
    var flag_mapps=2049;
    sess.loadLibrary("mobileApps"); 
    sess.updateDataFlags( 
        [{type: "type", data: "user", flags: flag_mapps, mode: 0}], 
        function (code) { 
            if (code) { msg(wialon.core.Errors.getErrorText(code)); return; }   
        var users = sess.getItems("user");
        for (var i = 0; i< users.length; i++) {
              var user = users[i];
              console.log(user.getName(),user.getId(), user.getMobileApps());
        }
    });
}

// Main function
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
}

// Help function
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
}

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
    
    if(!prod_value){ msg("Выбери продукт!"); return; };
    
    if (prod_value=="CP"){
        createNotification_CP();
        prod_value="";
        document.getElementById('CP').checked =false;
        document.getElementById('CMM').checked =false;
        document.getElementById('CMA').checked =false;
    }
    else if (prod_value=="CMM"){
        createNotification_CMM();
        prod_value="";
        document.getElementById('CP').checked =false;
        document.getElementById('CMM').checked =false;
        document.getElementById('CMA').checked =false;
    }
    else if (prod_value=="CMA"){
        createNotification_CMA();
        prod_value="";
        ocument.getElementById('CP').checked =false;
        document.getElementById('CMM').checked =false;
        document.getElementById('CMA').checked =false;
    }
}

function password_generator(  ) {
    if(!$("#username").val()){ msg("Введите имя пользователя"); return; }
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
}
        

// execute when DOM ready
$(document).ready(function () {
       // bind actions to button clicks
    
	$("#create_btn").click( button_work); // bind action to button click
        $("#Set_access").click( set_access );
        $("#create_user").click (createuser);
        $("#Update").click (Update);
        $("#Locale").click( Locale );    
        $("#Generate").click( password_generator);//
        
//loop1: for (var a = 0; a < 10000000; a++) {
//   if (a == 100000000) {
//       break loop1; // Только 4 попытки
//   }}
//         msg("2");

});

 