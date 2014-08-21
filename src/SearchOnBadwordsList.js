/**
 * Find which regular expression from badwords list detects the given expression
 * 
 * @source: based on function processBadWords from [[w:pt:MediaWiki:Gadget-antivandaltool.js]]
 */

var findRegexMatching = function ( text ) {
	var	data=$('#wpTextbox1').val().split('\n'),
		phrase=[],
		string=[],
		regex;
	var reg = {
		//             (  (                                    )       )
		repeatedChar: '(?:([^\\-\\|\\{\\}\\].\\s\'=wI:*#0-9a-f])\\2{2,})',
		strings:'(?:<LIST>)',
		phrases:'(?:^|[^/\\w])(?:<LIST>)(?![/\\w])'
	};
	for (var i=0; i<data.length; ++i) {
		var s=data[i];

		// ignore empty lines, whitespace-only lines and lines starting with '<'
		if (/^\s*$|^</.test(s)) { continue; }

		// lines beginning and ending with a (back-)slash (and possibly trailing
		// whitespace) are treated as regexps
		if (/^([\\\/]).*\1\s*$/.test(s)) {
			var isPhrase=(s.charAt(0)=='/');
			// remove slashes and trailing whitespace
			s=s.replace(/^[\\\/]|[\\\/]\s*$/g, '');
			// escape opening parens: ( -> (?:
			// FIXME This changes the behavior of regexes such as /[abc(def]/ or /abd\(def/
			// http://rubular.com/r/8eqSxXIiVZ
			s=s.replace(/\((?!\?)/g, '(?:');
			// check that s represents a valid regexp
			try { var r=new RegExp(s); }
			catch (err) {
				jsMsg(
					'Aviso: a linha '+i+' da lista de palavrões foi ignorada' +
					' pois continha uma expressão regular estranha:<pre>' + s + '</pre>'
				);
				continue;
			}
			regex = new RegExp( ( isPhrase? reg.phrases : reg.strings ).replace('<LIST>', s ) );
		} else {
			// treat this line as a non-regexp and escape it.
			regex = new RegExp( reg.phrases.replace('<LIST>', $.escapeRE(s) ) );
		}
		if( regex.test( text ) ){
			return 'A regex "' + regex + '" construída a partir da linha que contém "' +
				data[i] + '" detectou a expressão "' + text + '".';
		}
	}
	//new RegExp(s);
	//badWords.test( 'aslkjasd')
	window.badWords = '(' + reg.repeatedChar +
		(string.length? '|' + reg.strings.replace('<LIST>', string.join('|') ) : '') +
		(phrase.length? '|' + reg.phrases.replace('<LIST>', phrase.join('|') ) : '') +
		')';
	window.badWords = RegExp( window.badWords, 'gi');
};
var addLink = function(){
	$( mw.util.addPortletLink(
		'p-cactions',
		'#',
		'Qual REGEX detecta ...?',
		'#ca-check-regexes',
		'Confere qual das expressões regulares da lista de palavrões detecta a expressão fornecida'
	) ).click( function (e) {
		e.preventDefault(); // prevent '#' from appearing in URL bar
		var expr = prompt( 'Deseja encontrar a expressão regular que detecta qual expressão?', 'Texto de exemplo' );
		if( expr ){
			alert( findRegexMatching( expr ) );
		}
	} );
};

if( mw.config.get('wgPageName') === 'Wikipédia:Software/Anti-vandal_tool/badwords' && $.inArray(mw.config.get('wgAction'), [ 'edit', 'submit' ]) !== -1 ){
	$(addLink);
}