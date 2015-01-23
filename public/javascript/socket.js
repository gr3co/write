var upvote, downvote, force_update;

(function() {

	var socket = io('/');

	socket.emit('request_sentences');

	var generate_score_div = function(score, voted) {
		return $('<div class="score">').attr('aria-voted', voted)
		.append($('<div class="upvote-arrow">').addClass(voted == 'upvote' ? 'upvoted' : '')
      .append($('<a href="#" onclick="upvote(this);return false"><i class="fa fa-chevron-up"></i></a></div')))
		.append($('<div>').addClass(score > 0 ? "score-positive"
			: score == 0 ? "score-neutral"
			: "score-negative" ).text(score))
		    .append($('<div class="downvote-arrow">').addClass(voted == 'downvote' ? 'downvoted' : '')
      .append($('<a href="#" onclick="downvote(this);return false"><i class="fa fa-chevron-down"></i></a></div')))

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
    var parent = $(element).parent().parent();
    var voted = parent.attr('aria-voted');
    if (voted == 'none') {
      var idnum = parent.parent().attr('aria-idnum');
      socket.emit('upvote', idnum);
      parent.attr('aria-voted', 'upvote');
      $(element).parent().addClass('upvoted');
    }
  }

  downvote = function(element) {
    var parent = $(element).parent().parent();
    var voted = parent.attr('aria-voted');
    if (voted == 'none') {
      var idnum = parent.parent().attr('aria-idnum');
      socket.emit('downvote', idnum);
      parent.attr('aria-voted', 'downvote');
      $(element).parent().addClass('downvoted');
    }
  }

  force_update = function() {
    socket.emit('force_update');
  }

	$('#new-sentence-submit').click(function() {
		socket.emit('new_sentence', $('#new-sentence-text').val());
		$('#new-sentence-text').empty();
	});

	socket.on('sentence', function(val) {
		$($('<div class="sentence">')
      .attr('aria-idnum', val.idnum)
			.append(generate_score_div(val.score, 'none'))
			.append(generate_content_div(val.content)))
		.insertBefore('#new-sentence-divider');
	});

	socket.on('sentences', function(val) {
		var sorted = val.sort(function(a,b) {return b.score - a.score;});
		var container = $('#sentences');
		container.empty();
		for (var i = 0; i < sorted.length; i++) {
      var vote = sorted[i].upvoted ? "upvote" :
                  sorted[i].downvoted ? "downvote" : "none";
			container.append($($('<div class="sentence">')
				.addClass(i == 0 ? "sentence-top" : 0)
        .attr('aria-idnum', sorted[i].idnum)
				.append(generate_score_div(sorted[i].score, vote))
				.append(generate_content_div(sorted[i].content))));
		}
	});

  socket.on('sentence_confirm', function() {
    display_info("Sentence successfully submitted.");
  });

	socket.on('no_story', function() {
		display_error("There isn't a story right now. Come back later!")
	});

  socket.on('score_update', function(val) {
    var sentence_dom = $('.sentence[aria-idnum=' + val.idnum + '] .score');
    sentence_dom.children('[class^=score]')
      .removeClass()
      .addClass(val.score > 0 ? "score-positive"
      : val.score == 0 ? "score-neutral"
      : "score-negative" )
      .text(val.score);
  });

  socket.on('story_update', function(val) {
    $('#story p').append("&nbsp;"+val);
    $('#sentences').empty();
  });

})();
