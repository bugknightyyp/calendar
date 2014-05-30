module.exports = function(grunt) {
  var style = require('grunt-cmd-transport').style.init(grunt);
  var css2jsParser = style.css2jsParser;
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
	  transport:{
	     options :{
		   idleading: '<%= pkg.name %>/<%= pkg.version %>/',
		   debug:false
	    },
	    cal :{
       options: {
        alias: {
          'style': './calendar.css'
        }
       },
	     files: [{
        expand: true,
        cwd: 'temp/',
        src: '*.js',
        dest: 'temp/'
      }]
	   },
	   css: {
			options: {
			  parsers: {
			   '.css': [css2jsParser],
			  }
			},
			files: [{
        expand: true,
        cwd: 'temp/',
        src: '*.css',
        dest: 'temp/'
      }]
    }
	},
	concat: {
		options: {
		  banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
		  separator: ';'
		},
		dist: {
		  src: ['dist/<%= pkg.name %>.js', 'dist/<%= pkg.name %>.css.js'],
		  dest: 'dist/<%= pkg.name %>.concat.js'
		}
  },
	uglify: {
		options: {
		// banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
			//cwd:"dist"
		},
		build: {
			files:{
				"dist/<%= pkg.name %>.cmd.min.js": "temp/*.js"
			  }
      }
  },
	copy: {
    cal:{
      files: {
        "temp/calendar.cmd.min.js": "src/calendar.js"
      }
    }
    
  },
  less: {
   
    dev: {
      files: {
       "css/calendar.css": "css/calendar.less"
      }
    },
    pro: {
      options:{
        cleancss: true,
        modifyVars: {
            imgPath: '"http://wres.mangocity.com/js/lib/<%= pkg.name %>/<%= pkg.version %>/img/"',
          }
      },
      files: {
       "temp/calendar.css": "css/calendar.less"
      }
    }
  },
  clean:{
    temp: ["temp"]
  }
	
  }); 
  
  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-cmd-transport');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-less');
  
  grunt.registerTask('default', ['copy', 'transport:cal', 'less:pro', 'transport:css', 'uglify']);

};