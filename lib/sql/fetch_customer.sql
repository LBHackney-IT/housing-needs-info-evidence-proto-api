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
  (SELECT CASE
      WHEN app_band = 'PRY' THEN 'HOM'
      ELSE app_band
      END as app_band, app_ref, u_novalet_ref, u_eff_band_date
  from wlapp) as wlapp
  JOIN wlaneeds_cte ON wlapp.app_ref = wlaneeds_cte.app_ref
WHERE u_novalet_ref = @biddingNumber