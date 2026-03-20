(function (global) {
  'use strict';

  if (typeof global.createMicroContentArchitecture === 'function') return;

  function text(value, fallback) {
    var normalized = String(value == null ? '' : value).trim();
    return normalized || (fallback || '');
  }

  function toUnit(id, title, body) {
    return {
      id: id,
      title: text(title),
      body: text(body)
    };
  }

  function buildTrendStack(source) {
    return {
      context: {
        title: text(source.probTitle, 'Context'),
        body: text(source.probBody, source.summary || source.description || '')
      },
      insight: {
        title: text(source.insightTitle, 'Insight'),
        body: text(source.insightBody, source.summary || '')
      },
      howItWorks: {
        title: text(source.fwTitle, 'How it works'),
        items: [
          toUnit('fw-1', source.fw1h, source.fw1d),
          toUnit('fw-2', source.fw2h, source.fw2d),
          toUnit('fw-3', source.fw3h, source.fw3d)
        ].filter(function (item) {
          return item.title || item.body;
        })
      },
      impact: {
        title: text(source.exTitle, 'Impact'),
        items: [
          toUnit('impact-1', source.ex1h, source.ex1d),
          toUnit('impact-2', source.ex2h, source.ex2d),
          toUnit('impact-3', source.ex3h, source.ex3d)
        ].filter(function (item) {
          return item.title || item.body;
        })
      },
      takeaways: {
        title: text(source.clTitle, 'Takeaways'),
        items: [source.cl1, source.cl2, source.cl3].map(function (item, index) {
          return { id: 'takeaway-' + (index + 1), body: text(item) };
        }).filter(function (item) {
          return item.body;
        })
      }
    };
  }

  function createMicroContentArchitecture() {
    return {
      parseAndRegister: function (payload) {
        var source = payload && typeof payload === 'object' ? payload : {};
        return {
          source: source,
          units: {
            feedCard: {
              title: text(source.title, 'VIA Story'),
              body: text(source.summary, source.insightBody || source.probBody || ''),
              ctaText: text(source.cta, 'Open deep dive'),
              unitIds: [text(source.storyKey, 'story')]
            },
            trendStack: buildTrendStack(source),
            creatorDraft: {
              title: text(source.title, 'Creator Draft'),
              body: text(source.summary, source.insightBody || source.probBody || ''),
              callToAction: text(source.cta, 'Publish this angle')
            },
            socialPreview: {
              title: text(source.title, 'VIA Preview'),
              body: text(source.summary, source.insightBody || source.probBody || ''),
              tag: text(source.catLabel, 'VIA Story')
            }
          }
        };
      },
      composer: {
        composeFeedCard: function (units) {
          return units && units.feedCard ? units.feedCard : { body: '', ctaText: '', unitIds: [] };
        },
        composeTrendStack: function (units) {
          return units && units.trendStack ? units.trendStack : buildTrendStack({});
        },
        composeCreatorDraft: function (units) {
          return units && units.creatorDraft ? units.creatorDraft : { title: '', body: '', callToAction: '' };
        },
        composeSocialPreview: function (units) {
          return units && units.socialPreview ? units.socialPreview : { title: '', body: '', tag: '' };
        }
      }
    };
  }

  global.createMicroContentArchitecture = createMicroContentArchitecture;
})(window);
