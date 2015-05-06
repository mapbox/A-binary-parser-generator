var minimist = require('minimist');
var fs = require('fs');
var generateParser = require('./transform');

// shell-executed using node?
if(typeof process.argv !== "undefined") {
  var argv = minimist(process.argv.splice(2));
  var debug = argv['debug'];

  // generate the parser code
  var specfile = fs.readFileSync(argv['_'][0], 'utf8');
  var parsercode = generateParser(specfile, { debug: debug });

  // if we're not immediately running this code,
  // print it to terminal or pipe to file, what have you.
  if (argv['_'].length === 1) {
    console.log(parsercode);
  }

  // OH NO! EVAL! ... which is perfectly fine, since
  // the generator generates source code for independent
  // use. Normally you'd save it to a .js file, but in
  // this case we want to immediately make use of it.
  eval(parsercode);

  // parsable object
  var setupParseData = function(data) {
    return {
      pointer: 0,
      marks: [],
      bytecode: data
    };
  };

  // Do we have a file that we want to immediately read in?
  if (argv['_'].length > 1) {
    // run the parser on a file
    var data = setupParseData(fs.readFileSync(argv['_'][1]));
    var parser = new Parser({ debug: debug });

    // png image
    if (argv['_'][1].indexOf('.png') > -1) {
      var png = parser.parse(data);
      var IHDR = parser.getInstance("IHDR");
      var pHYs = parser.getInstance("pHYs");
      console.log("This is a "+IHDR.BitDepth+" bit "+IHDR.Width+" x "+IHDR.Height+" pixel image (with ppu dimensions "+pHYs.PixelsPerUnitXaxis+" x "+pHYs.PixelsPerUnitYaxis+")");
    }

    // font
    if (argv['_'][1].indexOf('.ttf') > -1 || argv[1].indexOf('.otf') > -1) {
      var font = parser.parse(data);
      var maxp = parser.getInstance("maxp");
      console.log("font information: "+maxp.numGlyphs+" glyphs.");
    }
  }
}
