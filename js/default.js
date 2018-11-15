var words = [];
var states = [[]];
var globalState = 0;
var globalMachine = [];

$(document).ready(function() {
    $(".add-word").click(function(){
        addWord(($('.new-word').val()).toLowerCase());
        updateMachine();
        console.log(globalMachine);
    });

    $('.verify-word').keyup(() => {
		if (globalMachine.length > 0){
			verifyWord($('.verify-word').val());
		}
	});
})

function addWord(word) {
    // Verify if the field was not empty and if the word in not in the dict
    if (word && jQuery.inArray(word, words) == -1) {
        words.push(word);
        $('#dict').append(`<tr><td>${word}</td></tr>`);
        $('.new-word').val('')
    } else {
        alert('Word is not correct');
    }
}

function updateMachine() {
    var next = 0;

    words.forEach(word => {
        var curr = 0;
        for (i = 0; i<word.length; i++) {
            if (typeof states[curr][word[i]] === 'undefined') {
                next = globalState + 1;
                states[curr][word[i]] = next;
                states[next] = [];
                globalState = curr = next;
            } else {
                curr = states[curr][word[i]];
            }
            if (i == (word.length -1)) {
                states[curr]['final'] = true;
            }
        }
    });

    // console.log(states);
    $('#machine').html('');
    var machine = [];
    for (i = 0; i < states.length; i++) {
        var aux = [];
        var row = '';
        for(j = 'a'.charCodeAt(0); j <= 'z'.charCodeAt(0); j++) {
            var letter = String.fromCharCode(j);
            if (typeof states[i][letter] == 'undefined') {
               row = row + `<td class="column-${letter}">-</td>`;
               aux[letter] = '-';
            } else {
                row = row + `<td class="column-${letter}">q${states[i][letter]}</td>`;
                aux[letter] = states[i][letter];
            }
        }

        if (typeof states[i]['final'] !== 'undefined') {
            row = `<td>q${i}*</td>` + row;
            aux['final'] = true;
        } else {
            row = `<td>q${i}</td>` + row;
        }
        
        $('#machine').append(`<tr class="row-${i}">${row}</tr>`);

        machine.push(aux);
    }

    globalMachine = machine;
}

function verifyWord(word){
    var state = 0;
    console.log(word);
    for (var i = 0; i < word.length; i++) {
        $('#machine tr').removeClass('focus-row');
        $('#machine td').removeClass('focus-col');
        $('#machine tr').removeClass('focus-row-erro');
        $('#machine td').removeClass('focus-col-erro');
        if (word[i] >= 'a' && word[i] <= 'z'){            
            $('#machine .row-' + state).addClass('focus-row');
            $('#machine .column-' + word[i]).addClass('focus-col');
        } else if(word[i] == '-') {
            $('#machine .linha-' + estado).addClass('focus-row-err');
            $('#machine .coluna-' + palavra).addClass('focus-col-err');
        }
    }
}