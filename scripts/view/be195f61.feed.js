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
        var linkElem = $(clip.domElement).next();
        var link = linkElem.attr('placeholder');
        linkElem.attr('placeholder',' Copied to clipboard!');
        setTimeout(function() {
            linkElem.attr('placeholder', linkElem.attr('url'));
        }, 1000);
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
            this.template = _.template($('#feed_template').html());
            this.render();
            this.views = [];
            this.link = 'generating...';
            var urlChildren = this.model.child('urls');
            urlChildren.ref().on('child_added', this.onUrlAdded, this);
            urlChildren.ref().on('child_removed', this.onUrlRemoved, this);
            this.model.child('link').ref().on('value', this.onLinkChanged, this);
            this.model.child('name').ref().on('value', this.onNameChanged, this);
            this.itemCount = 0;
        },
        onNameEdited: function(ev) {
            var elem = this.$('input.name');
            console.log('onNameEdited', elem.val());
            this.model.child('name').ref().set(elem.val());
        },
        onNameChanged: function(name) {
            this.$('.label.name').text(name.val());
        },
        onLinkChanged: function(link) {
            this.link = 'http://feedmixalot.herokuapp.com/' + link.val();
            this.$('.shorty').attr('placeholder', this.link);
            this.$('.shorty').attr('url', this.link);
        },
        onRemove: function(ev) {
            this.model.ref().once('value', function(dataSnapshot) {
                var link = dataSnapshot.val().link;
                var links = new Firebase('https://feedmixalot.firebaseIO.com/links/');
                links.child(link).remove();
                this.model.ref().remove();
            }, this);
        },
        onEditToggle: function(ev) {
            this.$('.editor').toggle();
        },
        onCopy: function(ev) {
            console.log('onCopy', this.link);
            clip.setText(this.link);

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
        },
        onUrlAdded: function(urlChildSnapshot) {
            var view = new UrlView({
                model: urlChildSnapshot
            });
            this.views[urlChildSnapshot.name()] = view;
            this.$('.urls').append(view.render().el);
            console.log('onUrlAdded');
        },
        renderCount: function() {
            this.$('.count').text(this.itemCount);
        },
        render: function() {
            var urls = this.$('.urls').children().detach();
            this.$el.html(this.template(_.extend(this.model.val(), {
                url: this.link
            })));
            this.$('.urls').append(urls);
            return this;
        }
    });
    return FeedView;
});