define(function(require, exports, module){
  var $ = require("jquery/1.11.0/jquery.cmd.min");
  require("style");
  
  
  var util = {};
     util.calMonth = function( date, num){ //时间对象，num 是正负整数，单位是月  
            return new Date ( new Date( date.getFullYear(), date.getMonth(), 1 ).setMonth( date.getMonth() + num ) );
          };
    util.addZero = function(str){
        return  str.toString().length==2 ? str: '0'+str;
    };
    util.cutZero = function(str){
        return str.toString().substr(0,1)=='0'?parseInt(str.substring(1)):parseInt(str);
    };
    util.intervalDate = function( sDate, bDate ){
      var deno =  24 * 60 *60 * 1000;
      var num =  (sDate.getTime() - bDate.getTime()) / deno;
      
      return num > 0? Math.floor(num) : Math.ceil( num );      
    };
    util.calDate = function( date, num){ //时间对象，num 是正负整数，单位是天
       return new Date( date.setDate( date.getDate() + parseInt( num ) ) );
    };
    util.formatDate = function( date ){
        return date.getFullYear() + "-" + util.addZero( date.getMonth() + 1 ) + "-" + util.addZero( date.getDate() );  
    };
    util.parseDate = function( str ){//yyyy-mm-dd
      var temp = str.match(/\d{2,4}/g);
      return new Date(temp[0],parseInt(temp[1])-1,parseInt(temp[2]));
    };
    
    
  var calendar = (function(){
    
    
    return function(options ){
    
      var config = $.extend({
            skin: 1,
            num: 1,
            width: 206,
            isDayClickable : $.noop,// 当前日期是否可点
            initCallback: $.noop, //初始化回调前回调
            handleSomeDay: $.noop,//过滤处理某日期
            selectedCallback : $.noop, //选择完日期回调
            destroyCallback: $.noop //日历销毁回调
      }, options || {});
      
      var 
        monthCursor = null,//月份游标
        txtDate,
        self = this;
       
      var datePattern = /\d{4}(-\d{2}){2}/g;
    
      function getInfoOfDate(date) {//获取某一日期的当月1号的 年、月、日、星期、天数
        var result = {};
        
        result.year = date.getFullYear();
        result.month = date.getMonth() + 1;
        result.week = new Date( date.setDate(1) ).getDay();
        result.dates = new Date( new Date( date.setMonth( date.getMonth() +1 ) ).setDate( 0 ) ).getDate();
        
        return result;
      }
      
      
        
       /**
       *构造某一月份的面板
       *
       *@param {Date} date 某一日期
       *@param {Number} index 第一个月份
       *@return {HTMLElement} 某一月份的面板
       */
      function randerSomeMonth(date, index){
           var wrap = $("<div class=\"cal-wrap\">"
            +"         <div class=\"cal-wrap-h\"><span>2013</span>年<span>1</span>月</div>"
            +"         <div class=\"cal-wrap-b sepline\">"
            +"           <ul class=\"cal-week\"><li>日</li><li>一</li><li>二</li><li>三</li><li>四</li><li>五</li><li>六</li></ul>"
            +"           <ul class=\"cal-date\">"
            +"           </ul>"
            +"         </div>"
            +"      </div>"),
           header = wrap.children(".cal-wrap-h"),
           body = wrap.children( ".cal-wrap-b" ),
           dates = body.children(".cal-date"),
           info = getInfoOfDate(date),
           length = info.week + info.dates,
           tempDate,
           str = "",
           dayEl,
           i = 0,
           noneDate = "<li data-clickable='false' class=\"none\"></li>";
           for(; i < info.week; i++ ){
             dates.append( noneDate );
           }
           
          for( i = 0; i < info.dates; i++ ){
               dayEl = $( "<li></li>" );
               tempDate = new Date( info.year, info.month - 1, i + 1 );
               dayEl.html( i + 1 ).attr({"date": info.year + "-" + util.addZero( info.month ) + "-" + util.addZero( i + 1 ), week: tempDate.getDay()});
               
             
                config.handleSomeDay.call(dayEl, tempDate);
                
               if ( !config.isDayClickable.call( dayEl, tempDate) ){ 
                  dayEl.attr("data-clickable", false);
                  dayEl.addClass("disable");                 
               } else { //既然不能点，所以也没必要再添加任何信息了
               
                
               }
               dates.append( dayEl );
          }
          for (; i < 42 - info.week; i++) {
              dates.append(noneDate);
          }  
           
           if ( index + 1 ==config.num ) {
              body.removeClass( "sepline" );
           }
           
           header.html("<span>"+info.year+"</span>年<span>"+info.month+"</span>月");
           return wrap;
            
      }
      
      
      function buildMonths(panel) {
        var tempWraper = $("<div>");
        for(var i = 0; i< config.num; i++) {
          tempDate = util.calMonth(monthCursor, i);
          tempWraper.append(randerSomeMonth(tempDate, i));
          panel.children(".cal-wraps").html(tempWraper);
        }
      }
      
      function buildCalendar() {
        var tempDate = null;
        var panel = $("<div class=\"calendar  calendar-skin-"+ config.skin +"\" style=\"width:"+ config.width * config.num  +"px;\">"
              +"    <div class=\"cal-btn-l\"></div>"
              +"    <div class=\"cal-btn-r\"></div>"
              +"    <div class=\"cal-wraps\" style=\"width:"+ config.width * config.num  +"px;\">"
              +"    </div>"
              +"</div>");
        config.initCallback.call(this);
        
        monthCursor = monthCursor || new Date();
        
        buildMonths(panel);
        handleEvent(panel);
        
        
        
        this.panel = panel;
        this.isCreated = true;
        
        return panel;
      };
       
      function handleEvent(panel) {
        panel.on("click", "[class^='cal-btn']", function(e){
          if ( $(this).is(":first-child")) {
            monthCursor = util.calMonth(monthCursor, -1);
          } else {
            monthCursor = util.calMonth(monthCursor, 1);
          }
          
          buildMonths(panel);
        })
          .on("click", ".cal-date li[data-clickable!='false']", function(e) {
            config.selectedCallback.call(this);
            //self.destroy();
            
        })
          .click(function(e){
          e.stopPropagation();
        });
        
       
      };
      
      
      this.setMonthCursor = function(date){
        monthCursor = date;
      }
      this.monthCursor = monthCursor;
      this.isCreated = false;
      this.config = config;
      this.buildCalendar = buildCalendar;
      //开始生成
      //buildCalendar.call(this);
      
      };
  
  })();
  
  calendar.prototype.destroy = function() {
    
    this.panel.remove();
    this.isCreated = false;
    this.config.destroyCallback.call(this);
    $(document).unbind("click.calendar");
  };
 
  
  
  var calendar_proxy = function(options){
  
    var cal = new calendar($.extend( {
              isDayClickable: function(date){// this : $( el ),date : object, today úobject
                return true;
              },
              
              destroyCallback: function(){
              }
          }, options));
          
          
    
    
    return cal;
    
  };
   
  calendar_proxy.util = util;
  
  module.exports = calendar_proxy;
})