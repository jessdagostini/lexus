var words = [];
var states = [[]];
var globalState = 0;
var globalMachine = [];

var primaryWords = ['include', 'define', 'using', 'namespace', 'main', 'string', 'unsigned'];
primaryWords.forEach(word => {
    addWord(word);
})
updateMachine();

$(document).ready(function() {
    $(".dict").click(function(){
        $('.modal').addClass('is-active');
    });

    $(".close-modal").click(function(){
        $('.modal').removeClass("is-active");
    });

    $(".add-word").click(function(){
        addWord(($('.new-word').val()).toLowerCase());
    });

    $('.verify-word').keyup(() => {
		if (globalMachine.length > 0){
			verifyWord($('.verify-word').val());
		}
    });
})

function addWord(word) {
    // Verify if the field was not empty and if the word is not in the dict
    if (word && jQuery.inArray(word, words) == -1) {
        // Verify if are only acceptable chars
        var regex =  /([^A-Za-z_])/;
        if (!regex.test(word)) {
            words.push(word);
            $('#dict').append(`<span class="tag is-primary is-word word-${word}">${word}<button class="delete is-small remove-word" onclick="removeWord('${word}')"></button></span>`);
            updateMachine();
        } else {
            alert('Only alphabetical characters are allowed.');
        }
        $('.new-word').val('')
    } else {
        alert('Word already exists in dictionary');
    }
}

function removeWord(word) {
    words.splice($.inArray(word, words), 1);
    states = [[]];
    globalMachine = [[]];
    globalState = 0;
    $(".word-" + word).remove();
    updateMachine();
    $('.verify-word').val('');
    $('.verify-word').removeClass('valid');
    $('.verify-word').removeClass('invalid');
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
               row = row + `<td class="column-${letter} state-"><img src="img/favicon.png"/ ></td>`;
               aux[letter] = '-';
            } else {
                row = row + `<td class="column-${letter}">q${states[i][letter]}</td>`;
                aux[letter] = states[i][letter];
            }
        }

        if (typeof states[i]['final'] !== 'undefined') {
            row = `<td class="states">q${i}*</td>` + row;
            aux['final'] = true;
        } else {
            row = `<td class="states">q${i}</td>` + row;
        }
        
        $('#machine').append(`<tr class="row-${i}">${row}</tr>`);

        machine.push(aux);
    }

    globalMachine = machine;
    console.log(globalMachine);
}

function verifyWord(word){
    var state = 0;
    for (var i = 0; i < word.length; i++) {
        $('#machine tr').removeClass('focus-row');
        $('#machine td').removeClass('focus-col');
        $('#machine tr').removeClass('focus-row-err');
        $('#machine td').removeClass('focus-col-err');

        if (word[i] >= 'a' && word[i] <= 'z'){
            if (globalMachine[state][word[i]] != '-'){
                $('#machine .row-' + state).addClass('focus-row');
                $('#machine .column-' + word[i]).addClass('focus-col');
                $('.verify-word').addClass('valid');
                $('.verify-word').removeClass('invalid');
                state = globalMachine[state][word[i]];
            } else {
                $('.verify-word').removeClass('valid');
                $('.verify-word').addClass('invalid');
                $('#machine .row-' + state).addClass('focus-row-err');
                $('#machine .column-' + word[i]).addClass('focus-col-err');
                state++;
            }
        } else if (word[i] == ' ') {
            if (globalMachine[state]['final']){
                $('#machine .row-' + state).addClass('focus-row');
                $('.verify-word').addClass('valid');
                $('.verify-word').removeClass('invalid');
                state = 0;
            }
        }
    }

    if (word.length == 0) {
        $('#machine tr').removeClass('focus-row');
        $('#machine td').removeClass('focus-col');
        $('#machine tr').removeClass('focus-row-err');
        $('#machine td').removeClass('focus-col-err');
        $('.verify-word').removeClass('valid');
        $('.verify-word').removeClass('invalid');
    }
}