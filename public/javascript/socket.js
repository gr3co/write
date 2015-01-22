var upvote, downvote;

(function() {

	var socket = io('/');

	socket.emit('request_sentences');

	var generate_score_div = function(score, id) {
		return $('<div class="score">')
		.append($('<div class="upvote-arrow"><a href="#" onclick="upvote(this);return false"><i class="fa fa-chevron-up"></i></a></div'))
		.append($('<div>').addClass(score > 0 ? "score-positive" 
			: score == 0 ? "score-neutral"
			: "score-negative" ).text(score))
		.append($('<div class="downvote-arrow"><a href="#" onclick="downvote(this);return false"><i class="fa fa-chevron-down"></i></a></div>'));

	}

	var generate_content_div = function(content) {
		return $('<div class="sentence-content">')
		.append($('<div class="sentence-text">').text(content));
	}

	var display_error = function(err) {
		$('#alerts')
		.append($('<div class="alert alert-danger alert-dismissable flush">')
			.append('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>')
			.append(err));
	}

	var display_info = function(info) {
		$('#alerts')
		.append($('<div class="alert alert-info alert-dismissable flush">')
			.append('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>')
			.append(info));
	}

  upvote = function(element) {
    var idnum = $(element).parent().parent().parent().attr('aria-idnum');
    socket.emit('upvote', idnum);
  }

  downvote = function(element) {
    var idnum = $(element).parent().parent().parent().attr('aria-idnum');
    socket.emit('downvote', idnum);
  }

	$('#new-sentence-submit').click(function() {
		socket.emit('new_sentence', $('#new-sentence-text').val());
		$('#new-sentence-text').empty();
	});

	socket.on('sentence_confirm', function(val) {
    display_info("Sentence successfully submitted.");
		$($('<div class="sentence">')
      .attr('aria-idnum', val.idnum)
			.append(generate_score_div(val.score))
			.append(generate_content_div(val.content)))
		.insertBefore('#new-sentence-divider');
	});

	socket.on('sentences', function(val) {
		var sorted = val.sort(function(a,b) {return a.score - b.score;});
		var container = $('#sentences');
		container.empty();
		for (var i = 0; i < sorted.length; i++) {
			container.append($($('<div class="sentence">')
				.addClass(i == 0 ? "sentence-top" : 0)
        .attr('aria-idnum', sorted[i].idnum)
				.append(generate_score_div(sorted[i].score))
				.append(generate_content_div(sorted[i].content))));
		}
	});

	socket.on('no_story', function() {
		display_error("There isn't a story right now. Come back later!")
	});

  socket.on('score_update', function(val) {
    var sentence_dom = $('.sentence[aria-idnum=' + val.idnum + '] .score');
    sentence_dom.children('[class^=score]').text(val.score);
  });

})();
