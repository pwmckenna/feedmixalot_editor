define([
    'jquery',
    'underscore',
    './view',
    './url'
], function($, _, View, UrlView) {
    'use strict';
    var FeedView = View.extend({
        events: {
            'click .removeFeed': 'onRemove',
            'click .edit': 'onEditToggle',

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
        attachClipboard: function() {
            if(this.clipboard) {
                this.clipboard.reposition();
                return;
            }

            this.clipboard = new ZeroClipboard(this.$('.copy')[0], {
                moviePath: 'scripts/components/zeroclipboard/ZeroClipboard.swf' 
            });

            var setText = _.bind(function(client) {
                this.clipboard.setText(this.getShortUrl());
            }, this);

            var unsetText = _.bind(function(client) {
                this.clipboard.setText('broken');
            }, this)

            this.clipboard.on('load', function(client) {
                console.log("movie is loaded");
            });

            this.clipboard.on('complete', function(client, args) {
                console.log("Copied text to clipboard: " + args.text );
            });

            this.clipboard.on('mouseover', setText);
            this.clipboard.on('mouseout', unsetText);
            this.clipboard.on( 'mousedown', setText);
            this.clipboard.on( 'mouseup', unsetText);
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
            this.attachClipboard();
            return this;
        }
    });
    return FeedView;
});