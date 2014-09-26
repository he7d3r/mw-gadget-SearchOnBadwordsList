/**
 * Find which regular expression from badwords list detects the given expression
 * 
 * @source: based on function processBadWords from [[w:pt:MediaWiki:Gadget-antivandaltool.js]]
 * @author: Helder (https://github.com/he7d3r)
 * @license: CC BY-SA 3.0 <https://creativecommons.org/licenses/by-sa/3.0/>
 */
( function ( mw, $ ) {
'use strict';

var findRegexMatching = function ( text ) {
	var	i, s, isPhrase, r,
		data=$('#wpTextbox1').val().split('\n'),
		regex,
		reg = {
			//             (  (                                    )       )
			repeatedChar: '(?:([^\\-\\|\\{\\}\\].\\s\'=wI:*#0-9a-f])\\2{2,})',
			strings:'(?:<LIST>)',
			phrases:'(?:^|[^/\\w])(?:<LIST>)(?![/\\w])'
		};
	for (i=0; i<data.length; ++i) {
		s=data[i];

		// ignore empty lines, whitespace-only lines and lines starting with '<'
		if (/^\s*$|^</.test(s)) { continue; }

		// lines beginning and ending with a (back-)slash (and possibly trailing
		// whitespace) are treated as regexps
		if (/^([\\\/]).*\1\s*$/.test(s)) {
			isPhrase=(s.charAt(0)==='/');
			// remove slashes and trailing whitespace
			s=s.replace(/^[\\\/]|[\\\/]\s*$/g, '');
			// escape opening parens: ( -> (?:
			// FIXME This changes the behavior of regexes such as /[abc(def]/ or /abd\(def/
			// http://rubular.com/r/8eqSxXIiVZ
			s=s.replace(/\((?!\?)/g, '(?:');
			// check that s represents a valid regexp
			try { r=new RegExp(s); }
			catch (err) {
				mw.notify(
					'Aviso: a linha '+i+' da lista de palavrões foi ignorada' +
					' pois continha uma expressão regular estranha:<pre>' + mw.html.escape(s) + '</pre>'
				);
				continue;
			}
			regex = new RegExp( ( isPhrase? reg.phrases : reg.strings ).replace('<LIST>', s ), 'gi');
		} else {
			// treat this line as a non-regexp and escape it.
			regex = new RegExp( reg.phrases.replace('<LIST>', $.escapeRE(s) ), 'gi');
		}
		if( regex.test( text ) ){
			return 'A regex<br><code>' + regex + '</code><br>construída a partir da linha que contém<br><code>' +
				data[i] + '</code><br>detectou a expressão "<code>' + mw.html.escape(text) + '</code>".';
		}
	}
	regex = new RegExp( '(' + reg.repeatedChar + ')', 'gi');
	if( regex.test( text ) ){
		return 'A regex<br><code>' + regex + '</code><br>definida no código-fonte do script detectou a expressão "<code>' + mw.html.escape(text) + '</code>".';
	}
	return 'A expressão "<code>' + mw.html.escape(text) + '</code>" não foi detectada.';
},
addLink = function(){
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
			mw.notify( findRegexMatching( expr ), { autoHide: false } );
		}
	} );
};

if( mw.config.get('wgPageName') === 'Wikipédia:Software/Anti-vandal_tool/badwords' && $.inArray(mw.config.get('wgAction'), [ 'edit', 'submit' ]) !== -1 ){
	$(addLink);
}

}( mediaWiki, jQuery ) );