define([
    'jquery',
    'underscore',
    './view',
    './url'
], function($, _, View, UrlView) {
    'use strict';
    var clip = new ZeroClipboard.Client();
    clip.setHandCursor(true);
    clip.addEventListener('complete', function(client, text) {
        console.log('Copied text to clipboard: ' + text);
        var linkElem = $(clip.domElement).next();
        var link = linkElem.attr('placeholder');
        linkElem.attr('placeholder', 'Copied!');
        var delay = 2000;
        setTimeout(function() {
            linkElem.attr('placeholder', link);
        }, delay);
    });

    var FeedView = View.extend({
        events: {
            'click .removeFeed': 'onRemove',
            'click .edit': 'onEditToggle',
            'mouseover .copy': 'onCopy',

            'click .editor .addUrl': 'onAddUrl',
            'keyup .editor .url': 'onAddUrlChange',
            'keyup .editor .name': 'onNameEdited'
        },
        initialize: function() {
            _.bindAll(this, 'preview', 'onUrlAdded', 'onUrlRemoved', 'onPreviewAvailable', 'onNameChanged');
            this.template = _.template($('#feed_template').html());
            this.render();
            this.views = [];
            var urlChildren = this.model.child('urls');
            urlChildren.ref().on('value', this.preview);
            urlChildren.ref().on('child_added', this.onUrlAdded);
            urlChildren.ref().on('child_removed', this.onUrlRemoved);
            this.model.child('name').ref().on('value', this.onNameChanged);
            this.itemCount = 0;
            this.preview = _.debounce(this.preview, 1000);
        },
        preview: function() {
            var req = $.ajax({
                url: this.getShortUrl(),
                cache: false
            });
            req.then(this.onPreviewAvailable);
        },
        onPreviewAvailable: function(data) {
            this.itemCount = $(data).find('rss > channel > item').length;
            console.log('onPreviewAvailable', this.itemCount);
            this.renderCount();
        },
        onNameEdited: function(ev) {
            var elem = this.$('input.name');
            console.log('onNameEdited', elem.val());
            this.model.child('name').ref().set(elem.val());
        },
        onNameChanged: function(name) {
            this.$('.label.name').text(name.val());
        },
        onRemove: function(ev) {
            this.model.ref().remove();
        },
        onEditToggle: function(ev) {
            this.$('.editor').toggle();
        },
        onCopy: function(ev) {
            console.log('onCopy', this.getShortUrl());
            clip.setText(this.getShortUrl());

            var elem = this.$('.copy')[0];
            if(clip.div) {
                clip.receiveEvent('mouseout', null);
                clip.reposition(elem);
            } else {
                clip.glue(elem)
            }
            clip.receiveEvent('mouseover', null);
        },
        onAddUrl: function(ev) {
            if(this.$('.editor .addUrl').hasClass('disabled')) {
                return;
            }
            this.model.child('urls').ref().push({
                url: this.$('.editor .input.url').val()
            });
            this.$('.editor .input.url').val('');
            this.$('.editor .addUrl').addClass('disabled');

            this.preview();
        },
        onAddUrlChange: function(ev) {
            if(this.$('.editor .input.url').val().length > 0) {
                this.$('.editor .addUrl').removeClass('disabled');
            } else {
                this.$('.editor .addUrl').addClass('disabled');
            }
        },
        onUrlRemoved: function(urlChildSnapshot) {
            this.views[urlChildSnapshot.name()].remove();
            delete this.views[urlChildSnapshot.name()];
            console.log('onUrlRemoved');
            this.preview();
        },
        onUrlAdded: function(urlChildSnapshot) {
            var view = new UrlView({
                model: urlChildSnapshot
            });
            this.views[urlChildSnapshot.name()] = view;
            this.$('.urls').append(view.render().el);
            console.log('onUrlAdded');
        },
        getShortUrl: function() {
            var url = 'http://feedmixalot.herokuapp.com/' + this.model.name();
            return url;
        },
        renderCount: function() {
            this.$('.count').text(this.itemCount);
        },
        render: function() {
            var urls = this.$('.urls').children().detach();
            this.$el.html(this.template(_.extend(this.model.val(), {
                url: this.getShortUrl(),
                count: this.itemCount
            })));
            this.$('.urls').append(urls);
            return this;
        }
    });
    return FeedView;
});