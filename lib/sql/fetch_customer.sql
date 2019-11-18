WITH
  wlaneeds_cte
  AS
  (
    SELECT
      wlaneeds.app_ref,
      MAX(r_to) AS bedrooms
    FROM
      wlaneeds
    WHERE
        field_ref = 'num_bedrooms'
    GROUP BY
        wlaneeds.app_ref
  )
SELECT
  app_band,
  u_eff_band_date,
  wlaneeds_cte.bedrooms
FROM
  wlapp
  JOIN wlaneeds_cte ON wlapp.app_ref = wlaneeds_cte.app_ref
WHERE u_novalet_ref = @biddingNumber