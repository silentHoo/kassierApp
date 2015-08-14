'use strict';

/**
 * @ngdoc function
 * @name kassierApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the kassierApp
 */
angular.module('kassierApp')
  .controller('MainCtrl', function ($scope) {
    $scope.showOrder = false;

    $scope.articles = [
      { cat: 'alc',  name: 'Bier',                price: 2.20 },
      { cat: 'alc',  name: 'Radler',              price: 2.20 },
      { cat: 'alc',  name: 'Cola',                price: 2.20 },
      { cat: 'alf',  name: 'Fanta',               price: 2.20 },
      { cat: 'alf',  name: 'Wasser',              price: 2.20 },
      { cat: 'alf',  name: 'Bratwurst (rot)',     price: 2.20 },
      { cat: 'fod',  name: 'Bratwurst (weiss)',   price: 2.20 },
      { cat: 'fod',  name: 'Steakweck',           price: 2.20 },
      { cat: 'fod',  name: 'Tomate-Mozzarella',   price: 2.20 },
      { cat: 'fod',  name: 'Pommes',              price: 2.20 },
      { cat: 'fod',  name: 'Currywurst',          price: 2.20 }
    ];
    $scope.alc = $scope.articles.filter(function(e) {
      return e.cat == 'alc';
    });
    $scope.alf = $scope.articles.filter(function(e) {
      return e.cat == 'alf';
    });
    $scope.fod = $scope.articles.filter(function(e) {
      return e.cat == 'fod';
    });

    $scope.orders = [{
      tableNumber: 123,
      articles: [
        { cat: 'alf',  name: 'Fanta',             price: 2.20 },
        { cat: 'alf',  name: 'Wasser',            price: 2.20 },
        { cat: 'alf',  name: 'Bratwurst (rot)',   price: 2.20 },
        { cat: 'fod',  name: 'Bratwurst (weiss)', price: 2.20 }
      ]
    }, {
      tableNumber: 456,
      articles: [
        { cat: 'alf',  name: 'Fanta',             price: 2.20 },
        { cat: 'fod',  name: 'Bratwurst (weiss)', price: 2.20 }
      ]
    }];

    $scope.tableNumber = '';
    $scope.orderList = [];
    $scope.openOrder = function() {
      $scope.tableNumber = '';
      $scope.orderList = [];
      $scope.showOrder = true;
    };

    $scope.abortCounter = 3;
    $scope.closeOrder = function(abort) {
      if (abort === true) {
        if (--$scope.abortCounter == 0) {
          $scope.abortCounter = 3;
          $scope.showOrder = false;
        }
        return;
      }

      if ($scope.tableNumber === '') {
        return;
      }

      var orderExists = $scope.orders.filter(function(o) {
        return o.tableNumber === $scope.tableNumber;
      }).length === 1;

      if (orderExists) {
        // delete existing order for that table
        var arrIndex = $scope.orders.map(function(e) {
          return e.tableNumber;
        }).indexOf($scope.tableNumber);
        $scope.orders.splice(arrIndex, 1);
      }
      $scope.orders.push({
        tableNumber: $scope.tableNumber,
        articles: angular.copy($scope.orderList)
      });
      $scope.showOrder = false;
      calcArticleAggregation();
    };

    $scope.addArticle = function(article) {
      $scope.orderList.push(article);
    };

    $scope.removeArticle = function(article, event) {
      $scope.orderList.splice($scope.orderList.indexOf(article), 1);
      event.stopPropagation();
    };

    $scope.countOf = function(article) {
      return $scope.orderList.filter(function(e) {
        return e.cat === article.cat && e.name === article.name;
      }).length;
    };

    $scope.openOrderFromExistingOrder = function(oList) {
      $scope.orderList = oList.articles;
      $scope.tableNumber = oList.tableNumber;
      $scope.showOrder = true;
    };

    /**
     * functions for pickup
     */
    $scope.pickup = {
      alf: [],
      alc: [],
      fod: []
    };
    var calcArticleAggregation = function() {
      ['alf', 'alc', 'fod'].forEach(function(cat) {
        var allOfCat = $scope.orders
          .map(function(e) {
            return e.articles;
          });
        allOfCat = [].concat.apply([], allOfCat);
        allOfCat = allOfCat.filter(function(e) {
          return e.cat === cat;
        });

        var counts = {};
        allOfCat
          .map(function(e) {
            return e.name
          })
          .forEach(function(x) { counts[x] = (counts[x] || 0)+1; });

        var result = [];
        for (var o in counts) {
          result.push({
            count: counts[o],
            name: o
          });
        }
        $scope.pickup[cat] = result;
      });
    };

    /**
     * functions for billing
     */
    $scope.showBilling = false;
    var initBilling = function() {
      $scope.bill = {
        alc: [],
        alf: [],
        fod: []
      };
      $scope.billingSum = 0;
      $scope.billList = [];
      $scope.aggregatedBillList = [];
      $scope.currentBillingOrder = [];
    };
    initBilling();

    var calculateBillCategories = function(order) {
      ['alc', 'alf', 'fod'].forEach(function(cat) {
        var counts = {};
        order.articles.filter(function(a) {
          return a.cat === cat;
        }).map(function(a) {
          return a.name
        }).forEach(function(x) { counts[x] = (counts[x] || 0)+1; });

        var result = [];
        for (var o in counts) {
          result.push({
            cat: cat,
            name: o,
            price: getArticleByName(String(o)).price
          });
        }
        $scope.bill[cat] = result;
      });
    };

    $scope.makeBillForOrder = function(order) {
      initBilling();
      $scope.currentBillingOrder = order;
      calculateBillCategories($scope.currentBillingOrder);
      $scope.showBilling = true;
    };

    $scope.closeBilling = function() {
      $scope.showBilling = false;
    };

    var getArticleCountIn = function(article, list) {
      return list.filter(function(e) {
        return e.cat === article.cat && e.name === article.name;
      }).length;
    };

    $scope.inverseCountOfBill = function(article) {
      var billListCount = $scope.billList.filter(function(e) {
        return e.cat === article.cat && e.name === article.name;
      }).length;

      var orderListCount = getArticleCountIn(article, $scope.currentBillingOrder.articles);

      return orderListCount - billListCount;
    };


    $scope.addArticleToBill = function(article) {
      if ($scope.inverseCountOfBill(article) != 0) {
        $scope.billList.push(article);
        $scope.billingSum += article.price;
      }
    };

    $scope.removeArticleFromBill = function(article) {
      var totalCountOfThisArticle = $scope.currentBillingOrder.articles.filter(function(e) {
        return e.cat === article.cat && e.name === article.name;
      }).length;
      if ($scope.inverseCountOfBill(article) != totalCountOfThisArticle) {
        $scope.billList.splice($scope.billList.indexOf(article), 1);
        $scope.billingSum -= article.price;
      }
      event.stopPropagation();
    };

    $scope.$watch('billingSum', function(newValue, oldValue) {
      $scope.aggregatedBillList = calcArticleTotalCountAggregation();
    });

    $scope.addAllArticlesToBill = function() {
      $scope.billList = [];
      $scope.billingSum = 0;
      $scope.billList = angular.copy($scope.currentBillingOrder.articles);
      $scope.billList.forEach(function(article) {
        $scope.billingSum += article.price;
      });
    };

    $scope.payBill = function() {
      // 1) remove all $scope.billList items from $scope.currentBillingOrder
      $scope.currentBillingOrder.articles = $scope.currentBillingOrder.articles.filter(function(a) {
        var filter = true;
        console.log($scope.aggregatedBillList);
        var articleCountToDelete = $scope.aggregatedBillList.filter(function(b) {
          return b.article.cat === a.cat && b.article.name === a.name;
        });
        console.log(articleCountToDelete);
        $scope.billList.forEach(function(article) {
          if (a.cat === article.cat && a.name === article.name) {
            filter = false;
          }
        });
        if (!filter) {
          console.log('remove:');
          console.log(a);
        }
        return filter;
      });
      $scope.billList = [];

      calculateBillCategories($scope.currentBillingOrder);
      $scope.billingSum = 0; // trigers also recalculating of aggregatedBillList

      // 2) if there are no elements left on $scope.currentBillingOrder, delete tableNumber from $scope.orders
      if ($scope.currentBillingOrder.articles.length == 0) {
        $scope.orders = $scope.orders.filter(function(order) {
          return $scope.currentBillingOrder.tableNumber !== order.tableNumber;
        });
        $scope.showBilling = false;
      }
    };

    var getArticleByName = function(name) {
      return $scope.articles.filter(function(e) {
        return e.name === name;
      })[0];
    };

    var calcArticleTotalCountAggregation = function() {
      var counts = {};
      $scope.billList
        .map(function(e) {
          return e.name
        })
        .forEach(function(x) { counts[x] = (counts[x] || 0)+1; });

      var result = [];
      for (var o in counts) {
        var article = getArticleByName(String(o));
        var price = article.price;
        result.push({
          count: counts[o],
          name: o,
          singlePrice: price,
          sum: counts[o] * price,
          article: article
        });
      }
      return result;
    };
  });
